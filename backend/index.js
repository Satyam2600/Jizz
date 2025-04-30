const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");
const User = require("./models/User");
const Community = require('./models/Community');

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
app.use(express.static(path.join(__dirname, "../frontend/public"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve uploaded files
app.use("/assets/uploads", express.static(path.join(__dirname, "../frontend/assets/uploads"), {
  setHeaders: (res, path) => {
    // Set proper cache control headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));~

// Serve uploaded files (for posts/media)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

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
    // You may need to adjust this depending on your authentication/session logic
    const userId = req.user?.id || req.user?.userId || req.session.userId || req.session.user?.id;
    let user = null;
    if (userId) {
      user = await User.findById(userId).lean();
    }
    res.render("dashboard", { title: "Dashboard - JIZZ", user });
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
app.get("/confessions", async (req, res) => {
  const userId = req.user?.id || req.user?.userId || req.session.userId || req.session.user?.id;
  let user = null;
  if (userId) {
    user = await User.findById(userId).lean();
  }
  res.render("confessions", { title: "Confessions - JIZZ", user });
});

app.get("/communities", async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('members', 'name avatar')
      .sort({ createdAt: -1 });

    // Add isMember property for each community if user is logged in
    const userId = req.session.user?._id;
    const communitiesWithMembership = communities.map(community => ({
      ...community.toObject(),
      isMember: userId ? community.members.some(m => m._id.toString() === userId.toString()) : false
    }));

    res.render("communities", { 
      title: "Communities - JIZZ",
      communities: communitiesWithMembership,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.render("communities", { 
      title: "Communities - JIZZ",
      communities: [],
      user: req.session.user || null,
      error: "Failed to load communities. Please try again later."
    });
  }
});

// My Profile page (current user, session-based auth)
app.get('/profile', async (req, res) => {
  console.log('Session on /profile:', req.session);
  const userId = req.session.userId || (req.session.user && req.session.user._id);
  console.log('Resolved userId from session:', userId);
  if (!userId) {
    console.log('No userId in session, redirecting to /login');
    return res.redirect('/login');
  }
  const user = await User.findById(userId).lean();
  const Post = require('./models/Post');
  const posts = await Post.find({ user: userId }).sort({ createdAt: -1 }).lean();
  console.log('Rendering profile for user:', user && user.username);
  res.render('profile', { user, posts });
});

// Public profile by rollNumber
app.get('/profile/:rollNumber', async (req, res) => {
  try {
    const Post = require('./models/Post');
    const user = await User.findOne({ rollNumber: req.params.rollNumber }).lean();
    if (!user) return res.status(404).send('User not found');
    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).lean();
    // Add these lines:
    user.postsCount = posts.length;
    user.followersCount = user.followers ? user.followers.length : 0;
    user.followingCount = user.following ? user.following.length : 0;

    // --- BADGE LOGIC START ---
    // 1. Calculate total likes for this user
    const userTotalLikes = posts.reduce((sum, p) => sum + (p.likes || (p.likedBy ? p.likedBy.length : 0)), 0);
    // 2. Find user with most likes
    const allUsers = await User.find({}).lean();
    const allUserIds = allUsers.map(u => u._id);
    const allPosts = await Post.find({ user: { $in: allUserIds } }).lean();
    const likeMap = {};
    allUserIds.forEach(id => { likeMap[id.toString()] = 0; });
    allPosts.forEach(p => {
      if (p.user) {
        likeMap[p.user.toString()] += p.likes || (p.likedBy ? p.likedBy.length : 0);
      }
    });
    let mostLikesUserId = null, mostLikes = -1;
    Object.entries(likeMap).forEach(([uid, likes]) => {
      if (likes > mostLikes) {
        mostLikes = likes;
        mostLikesUserId = uid;
      }
    });
    // 3. Prepare badges array
    const badges = [];
    if (user._id.toString() === mostLikesUserId && mostLikes > 0) {
      badges.push({
        key: 'most_likes',
        label: 'Most Likes',
        description: 'Top liked user on JIZZ',
        icon: 'bi-fire',
      });
    }
    if (userTotalLikes >= 100) {
      badges.push({
        key: '100_likes',
        label: '100 Likes',
        description: 'Received 100+ likes',
        icon: 'bi-heart-fill',
      });
    }
    if (user.followersCount >= 100) {
      badges.push({
        key: '100_followers',
        label: '100 Followers',
        description: 'Has 100+ followers',
        icon: 'bi-people-fill',
      });
    }
    if (user.affiliatedWithJizz) {
      badges.push({
        key: 'affiliated',
        label: 'Affiliated with JIZZ',
        description: 'Officially affiliated with JIZZ',
        icon: 'bi-patch-check-fill',
      });
    }
    user.badges = badges;
    // --- BADGE LOGIC END ---

    res.render('profile', { user, posts });
  } catch (error) {
    res.status(500).send('Server error');
  }
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
const communityRoutes = require("./routes/communityRoutes");
const notifcationRoutes = require("./routes/notifcationRoutes");
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
app.use("/api/upload", uploadRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/notifications", notifcationRoutes);

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

app.get('/notifications', async (req, res) => {
  // You may want to add authentication here if needed
  let user = null;
  try {
    const userId = req.user?.id || req.user?.userId || req.session?.userId || req.session?.user?._id;
    if (userId) {
      const User = require('./models/User');
      user = await User.findById(userId).lean();
    }
  } catch {}
  res.render('notifications', { title: 'Notifications - JIZZ', user });
});

app.get('/chat', async (req, res) => {
  let user = null;
  try {
    const userId = req.user?.id || req.user?.userId || req.session?.userId || req.session?.user?._id;
    if (userId) {
      const User = require('./models/User');
      user = await User.findById(userId).lean();
    }
  } catch {}
  res.render('chat', { title: 'Chat - JIZZ', user });
});

module.exports = app;