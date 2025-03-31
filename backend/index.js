// backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express App
const app = express();

// Middleware: parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the "frontend/assets" directory
app.use("/assets", express.static(path.join(__dirname, "../frontend/assets")));

// Set up EJS as the view engine and define the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views")); // Updated path to views directory

// Default Route: Render the home page using EJS (index.ejs)
app.get("/", (req, res) => {
    res.render("index", { title: "JIZZ - Campus Social Network" });
});

// Route for Login Page
app.get("/login", (req, res) => {
    res.render("login", { title: "Login - JIZZ" });
});

// Route for Register Page
app.get("/register", (req, res) => {
    res.render("register", { title: "Register - JIZZ" });
});

// Route for Dashboard Page
app.get("/dashboard", (req, res) => {
    res.render("dashboard", { title: "Dashboard - JIZZ" });
});

// Route for Edit Profile Page
app.get("/edit-profile", (req, res) => {
    res.render("editProfile", { title: "Edit Profile - JIZZ" });
});

app.get("/forgotpassword", (req, res) => {
    res.render("forgotpassword", { title: "Forgot Password - JIZZ" });
});

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const confessionRoutes = require("./routes/confessionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reportRoutes = require("./routes/reportRoutes");
const contactRoutes = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const passwordresetRoutes = require("./routes/passwordresetRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Mount API Routes under proper endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/confessions", confessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/password-reset", passwordresetRoutes);
app.use("/api/uploads", uploadRoutes);

// Health Check Route
app.get("/health", (req, res) => res.send("🚀 JIZZ Social Media API Running..."));

// Export the app for use in server.js
module.exports = app;