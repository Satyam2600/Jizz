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

    // Real-time private messaging
    socket.on('sendMessage', (data) => {
      // data: { sender, receiver, content }
      // Emit to receiver if online
      const targetSocketId = userSocketMap[data.receiver];
      if (targetSocketId) {
        io.to(targetSocketId).emit('receiveMessage', data);
      }
      // Optionally, emit to sender for instant feedback
      const senderSocketId = userSocketMap[data.sender];
      if (senderSocketId && senderSocketId !== targetSocketId) {
        io.to(senderSocketId).emit('receiveMessage', data);
      }
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
