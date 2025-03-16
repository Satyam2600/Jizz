const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const confessionRoutes = require("./routes/confessionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const eventRoutes = require("./routes/eventRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/confessions", confessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => res.send("🚀 JIZZ Social Media API Running..."));

// Real-Time Messaging
io.on("connection", (socket) => {
  console.log("🟢 A user connected");
  socket.on("sendMessage", (data) => io.emit("receiveMessage", data));
  socket.on("disconnect", () => console.log("🔴 A user disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
