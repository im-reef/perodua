const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const fs = require("fs");

const app = express();
const PORT = 5002;

app.use(cors());
app.use(bodyParser.json());

//To read data.json file
let read = fs.readFileSync('data.json', 'utf-8');
let fullDataJSON = JSON.parse(read);

let storedData = [
    {
        "id": "PLC3",
        "dateLastStop": "",
        "dateStartRun": "",
        "dateNG_detected": "",
        "bulb": "", // Green Yellow Red
        "greenStatus": "", // machine on / -
        "yellowStatus": "", // NG Part detected / -
        "redStatus": "", // Machine stopped / -
        "countOK": null, 
        "countNG": null
    },
    {
        "id": "PLC2",
        "dateLastStop": "",
        "dateStartRun": "",
        "dateNG_detected": "",
        "bulb": "", // Green Yellow Red
        "greenStatus": "", // machine on / -
        "yellowStatus": "", // NG Part detected / -
        "redStatus": "", // Machine stopped / -
        "countOK": null, 
        "countNG": null
    },
    {
        "id": "PLC1",
        "dateLastStop": "",
        "dateStartRun": "",
        "dateNG_detected": "",
        "bulb": "", // Green Yellow Red
        "greenStatus": "", // machine on / -
        "yellowStatus": "", // NG Part detected / -
        "redStatus": "", // Machine stopped / -
        "countOK": null, 
        "countNG": null
    }
];

// Endpoint to receive user data
app.post("/api/data", (req, res) => {
    const { id, dateLastStop, dateStartRun, dateNG_detected, bulb, greenStatus, yellowStatus, redStatus, countOK, countNG } = req.body;
    storedData.push({ id, dateLastStop, dateStartRun, dateNG_detected, bulb, greenStatus, yellowStatus, redStatus, countOK, countNG });
    console.log("Received data:", { id, dateLastStop, dateStartRun, dateNG_detected, bulb, greenStatus, yellowStatus, redStatus, countOK, countNG });
    res.json({ message: "Data received successfully!" });

    // Broadcast data to all WebSocket clients
    if (wss.clients.size > 0) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(storedData)); // Send updated data to all connected clients
            }
        });
    }
});

// Endpoint to retrieve stored data
app.get("/api/data/:id", (req, res) => {

    let id = req.params.id;

    const allPlcData = fullDataJSON.filter(plc => plc.id === id)

    res.json(allPlcData);
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


// Update by name (PATCH)
app.patch("/api/data/:id", (req, res) => {
    const id = req.params.id;
    const { newLastStop, newStartRun, newNG_detected, newBulb, newGreenStatus, newYellowStatus, newRedStatus, newOK, newNG } = req.body;
    const PLC = storedData.find((u) => u.id === id);

    if (!PLC) {
        return res.status(404).json({ message: "User not found." });
    }

    if (newLastStop) PLC.dateLastStop = newLastStop;
    if (newStartRun) PLC.dateStartRun = newStartRun;
    if (newNG_detected) PLC.dateNG_detected = newNG_detected;
    if (newBulb) PLC.bulb = newBulb;
    if (newGreenStatus) PLC.greenStatus = newGreenStatus;
    if (newYellowStatus) PLC.yellowStatus = newYellowStatus;
    if (newRedStatus) PLC.redStatus = newRedStatus;
    if (newOK) PLC.countOK = newOK;
    if (newNG) PLC.countNG = newNG;

    console.log("Updated data:", PLC);
    res.json({ message: "PLC data updated successfully!", PLC });

    //--------------------------------------------------------------------> data.json start here
    if(!(newNG > 1000000)){
   
 	fullDataJSON = 0;

    	read = fs.readFileSync('data.json', 'utf-8');
    
    	fullDataJSON = JSON.parse(read);

    	fullDataJSON.unshift(PLC);

    	const toJSON = JSON.stringify(fullDataJSON, null, 2);

    
    	fs.writeFileSync('data.json', toJSON, 'utf-8');
	
	}
    // ------------------------------------------------------------------> write data to data.json stops here

    // Broadcast updated data to WebSocket clients
    if (wss.clients.size > 0) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(storedData)); // Send updated data to all connected clients
            }
        });
    }
});

// Set up WebSocket server
const wss = new WebSocket.Server({noServer: true});

// When a client connects to WebSocket server
wss.on('connection', (ws) => {
    console.log("A client connected via WebSocket");

    // Mark the client as alive when it connects
    ws.isAlive = true;

    // Send initial stored data to the client
    ws.send(JSON.stringify(storedData));

    // Listen for incoming messages from WebSocket clients
    ws.on('message', (message) => {
        try {
            const parsed = JSON.parse(message);
            if (parsed.type === 'heartbeat') {
                // Heartbeat received
                console.log(parsed);
                ws.isAlive = true;
                return;
            }

            // You can handle other message types here
            console.log('Received from client:', parsed);
        } catch (err) {
            console.log('Invalid JSON from client:', message);
        }
    });

    // Handle connection close
    ws.on('close', () => {
        console.log("Client disconnected from WebSocket");
    });
});

// Heartbeat check every 30 seconds
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log("Terminating dead WebSocket client");
            return ws.terminate();
        }

        ws.isAlive = false; // Expect client to respond before next check
        // Note: we’re not sending a native `ping()`, we expect the client to send heartbeats manually
    });
}, 30000);

// Upgrade HTTP server to handle WebSocket connections
app.server = app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});

app.server.on('upgrade', (request, socket, head) => {
    
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
    
});


