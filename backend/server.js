const http = require("http");
const { Server } = require("socket.io");
const app = require("./index"); // Import Express app
const setupSocket = require("./socket"); // Import WebSocket setup
const path = require("path");

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

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/login.ejs'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/login.ejs'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/register.ejs'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/forgotPassword.ejs'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/dashboard.ejs'));
});

app.get('/edit-profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/editProfile.ejs'));
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));