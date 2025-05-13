module.exports = (io) => {
  const userSocketMap = {};

  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    // Register userId with socketId
    socket.on("register", (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`[SOCKET] Registered user ${userId} with socket ${socket.id}`);
      console.log("[SOCKET] Current userSocketMap:", userSocketMap);
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
      console.log(`[SOCKET] sendMessage event:`, data);
      const targetSocketId = userSocketMap[data.receiver];
      if (targetSocketId) {
        console.log(`[SOCKET] Emitting receiveMessage to receiver ${data.receiver} (socket ${targetSocketId})`);
        io.to(targetSocketId).emit('receiveMessage', data);
      } else {
        console.log(`[SOCKET] Receiver ${data.receiver} not online.`);
      }
      // Optionally, emit to sender for instant feedback
      const senderSocketId = userSocketMap[data.sender];
      if (senderSocketId && senderSocketId !== targetSocketId) {
        console.log(`[SOCKET] Emitting receiveMessage to sender ${data.sender} (socket ${senderSocketId})`);
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
          console.log(`[SOCKET] User ${userId} disconnected and removed from userSocketMap.`);
          break;
        }
      }
      console.log(`🔴 User Disconnected: ${socket.id}`);
      console.log("[SOCKET] Current userSocketMap:", userSocketMap);
    });
  });
};
