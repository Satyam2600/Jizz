const http = require("http");
const { Server } = require("socket.io");
const app = require("./index"); // Import Express app
const setupSocket = require("./socket"); // Import WebSocket setup
const path = require("path");
const express = require("express");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Pass `io` to socket setup module
setupSocket(io);

// Attach io to app for global access (if needed)
app.set("io", io);

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/uploads", uploadRoutes);

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.get('/', (req, res) => {
    res.render("login", { title: "Login - JIZZ" });
});

app.get('/login', (req, res) => {
    res.render("login", { title: "Login - JIZZ" });
});

app.get('/register', (req, res) => {
    res.render("register", { title: "Register - JIZZ" });
});

app.get('/forgot-password', (req, res) => {
    res.render("forgotPassword", { title: "Forgot Password - JIZZ" });
});

app.get('/dashboard', (req, res) => {
    res.render("dashboard", { title: "Dashboard - JIZZ" });
});

app.get('/edit-profile', (req, res) => {
    res.render("editProfile", { title: "Edit Profile - JIZZ" });
});

app.get('/confessions', (req, res) => {
    res.render("confessions", { title: "Confessions - JIZZ" });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));