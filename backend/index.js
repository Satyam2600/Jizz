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

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// Static files
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

// Root route - must be first
app.get("/", (req, res) => {
  res.render("index", { 
    title: "JIZZ - Campus Social Network",
    user: req.session.user || null
  });
});

// Page routes
app.get("/login", (req, res) => {
  res.render("login", { title: "Login - JIZZ" });
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Register - JIZZ" });
});

app.get("/dashboard", async (req, res) => {
  try {
    res.render("dashboard", { title: "Dashboard - JIZZ" });
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    res.status(500).send("Server error");
  }
});

app.get("/edit-profile", (req, res) => {
  res.render("editProfile", { title: "Edit Profile - JIZZ" });
});

app.get("/change-password", (req, res) => {
  res.render("changePassword", { title: "Change Password - JIZZ" });
});

app.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword", { title: "Forgot Password - JIZZ" });
});

// API Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const confessionRoutes = require("./routes/confessionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const contactRoutes = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const passwordResetRoutes = require("./routes/passwordresetRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/confessions", confessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/uploads", uploadRoutes);

// Health check route
app.get("/health", (req, res) => res.send("🚀 JIZZ Social Media API Running..."));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    console.error('Multer error:', err);
    return res.status(400).json({ 
      message: 'File upload error', 
      error: err.message 
    });
  } else if (err) {
    console.error('Unknown error:', err);
    return res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
  next();
});

module.exports = app; 