const http = require("http");
const { Server } = require("socket.io");
const app = require("./index"); // Import Express app

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: { origin: "*" }, // Change this for production security
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
