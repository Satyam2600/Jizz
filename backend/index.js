const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Serve uploaded files
app.use("/assets/uploads", express.static(path.join(__dirname, "../frontend/assets/uploads")));

// Serve backend uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

app.get("/", (req, res) => {
  res.render("index", { title: "JIZZ - Campus Social Network" });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login - JIZZ" });
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Register - JIZZ" });
});

app.get("/dashboard", async (req, res) => {
  try {
    // For JWT authentication, we don't need to check session here
    // The frontend will handle authentication with the token
    res.render("dashboard", { title: "Dashboard - JIZZ" });
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    res.status(500).send("Server error");
  }
});

app.get("/edit-profile", (req, res) => {
  // For JWT authentication, we don't need to check session here
  // The frontend will handle authentication with the token
  res.render("editProfile", { title: "Edit Profile - JIZZ" });
});

app.get("/change-password", (req, res) => {
  res.render("changePassword", { title: "Change Password - JIZZ" });
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
const passwordResetRoutes = require("./routes/passwordresetRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

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
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/uploads", uploadRoutes);

// Error handling middleware for multer errors
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    // A Multer error occurred when uploading
    console.error('Multer error:', err);
    return res.status(400).json({ 
      message: 'File upload error', 
      error: err.message 
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Unknown error:', err);
    return res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
  next();
});

app.get("/health", (req, res) => res.send("🚀 JIZZ Social Media API Running..."));

module.exports = app; 