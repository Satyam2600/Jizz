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

app.use("/assets", express.static(path.join(__dirname, "../frontend/assets")));

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
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect("/login");

    res.render("dashboard", {
      user: {
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
        banner: user.banner,
        department: user.department,
        bio: user.bio,
        socialLinks: user.socialLinks,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Server error");
  }
});

app.get("/editProfile", (req, res) => {
 

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

app.get("/health", (req, res) => res.send("🚀 JIZZ Social Media API Running..."));

module.exports = app; 