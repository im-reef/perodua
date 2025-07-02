Overview 

This project creates a real-time dashboard for monitoring a simple production system using IoT sensors connected to a Raspberry Pi. It tracks: 
- Machine status (running or stopped)
- Part counts (good or not good)
  
The dashboard is served using Node.js, communicates using WebSocket, and is displayed through a basic HTML/CSS/JavaScript frontend. 

Tech Stack
- Node.js (backend server)
- WebSocket (real-time communication)
-  HTML, CSS, JavaScript (frontend)
-  PM2 (process manager)
-  Raspberry Pi (host and sensor interface)

Real-Time Communication 
- Server sends updates via WebSocket when: 
- Machine starts/stops
- A good or bad part is detected
  
Features 
- Live status display (RUN / STOP)
- Display all 3 PLCs (1 to 3)
- Count of good and bad parts
- Responsive and lightweight dashboard
  
Future Improvements
- Add charts for trend analysis
-  Store data in a database (e.g., MongoDB)
-  Add authentication for dashboard access
-  Add token in the API so only a certain device can adjust the content or get the API data (JWT Token)
-  Export logs to CSV

  
