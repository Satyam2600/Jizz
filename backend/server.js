const http = require("http");
const { Server } = require("socket.io");
const app = require("./index"); // Import Express app
const setupSocket = require("./socket"); // Import WebSocket setup

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000", // Match your frontend URL/port
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Pass `io` to socket setup module
setupSocket(io);

// Attach io to app for global access (if needed)
app.set("io", io);

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
