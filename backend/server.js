const http = require("http");
const { Server } = require("socket.io");
const app = require("./index"); // Import Express app
const setupSocket = require("./socket"); // Import WebSocket setup

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5500", // Change this to frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Pass `io` to `socket.js`
setupSocket(io);

// Attach io to req for global access
app.set("io", io);

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
