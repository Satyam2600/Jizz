const dotenv = require("dotenv");
const path = require("path");

// Configure dotenv with explicit path and debug mode
const envPath = path.join(__dirname, '.env');
const result = dotenv.config({ path: envPath, debug: true });

// Debug logging
console.log('Environment file path:', envPath);
if (result.error) {
    console.error('Error loading .env file:', result.error);
}
console.log('Loaded env vars:', process.env.MONGO_URI ? 'MONGO_URI is set' : 'MONGO_URI is missing',
    process.env.JWT_SECRET ? ', JWT_SECRET is set' : ', JWT_SECRET is missing');
console.log('Current directory:', __dirname);

const http = require("http");
const { Server } = require("socket.io");
const app = require("./index"); // Import Express app
const setupSocket = require("./socket"); // Import WebSocket setup
const express = require("express");
const Event = require("./models/Event");
const authMiddleware = require('./middleware/authMiddleware');
const connectDB = require("./config/db"); // Import the database connection function

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const eventRoutes = require('./routes/eventRoutes');
const communityRoutes = require('./routes/communityRoutes');

// Create HTTP Server
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach io to app for controller access
app.set('io', io);

require("./socket")(io);

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/uploads", uploadRoutes);

// Events routes
app.use('/api/events', eventRoutes);
app.use('/api/communities', communityRoutes);

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

// Events route (public, frontend JS will fetch events with token)
app.get('/events', async (req, res) => {
    res.render('events', {
        title: 'Events',
        events: [], // Let frontend JS load events
        user: null
    });
});

// Connect to MongoDB
connectDB();

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));