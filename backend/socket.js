module.exports = (io) => {
  const userSocketMap = {};

  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    // Register userId with socketId
    socket.on("register", (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`Registered user ${userId} with socket ${socket.id}`);
    });

    // Send notification to a specific user
    socket.on("sendNotification", ({ toUserId, notification }) => {
      const targetSocketId = userSocketMap[toUserId];
      if (targetSocketId) {
        io.to(targetSocketId).emit("notification", notification);
      }
    });

    // Handle incoming messages
    socket.on("sendMessage", (data) => {
      io.emit("receiveMessage", data);
    });

    // Handle joining a chat room
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`📌 User ${socket.id} joined room: ${room}`);
    });

    // Handle sending a message to a specific room
    socket.on("sendRoomMessage", ({ room, message }) => {
      io.to(room).emit("receiveRoomMessage", message);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Remove user from userSocketMap
      for (const [userId, sockId] of Object.entries(userSocketMap)) {
        if (sockId === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
      console.log(`🔴 User Disconnected: ${socket.id}`);
    });
  });
};
