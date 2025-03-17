module.exports = (io) => {
    io.on("connection", (socket) => {
      console.log(`🟢 User Connected: ${socket.id}`);
  
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
        console.log(`🔴 User Disconnected: ${socket.id}`);
      });
    });
  };
  