const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware"); // For admin-only actions
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const postController = require("../controllers/postController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images and Videos Only!");
  }
}

// 📌 Create a Post (With Mentions)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) return res.status(400).json({ message: "Post content is required" });

    // Extract mentioned usernames from content (@username)
    const mentionedUsernames = content.match(/@(\w+)/g) || [];
    const mentionedUsers = [];

    for (let username of mentionedUsernames) {
      const user = await User.findOne({ username: username.replace("@", "") }).select("_id");
      if (user) mentionedUsers.push(user._id);
    }

    const newPost = new Post({
      user: req.user.id,
      content,
      image,
      mentions: mentionedUsers, // Store mentioned users
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Get All Posts (Latest First)
router.get("/", authMiddleware, postController.getAllPosts);

// 📌 Get Posts by User ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    if (!posts.length) return res.status(404).json({ message: "No posts found" });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Like/Unlike a Post
router.post("/:id/like", authMiddleware, postController.toggleLike);

// 📌 Delete a Post (Only Owner Can Delete)
router.delete("/:id", authMiddleware, postController.deletePost);

// 📌 Report a Post
router.post("/:id/report", authMiddleware, postController.reportPost);

// Create a new post
router.post("/create", authMiddleware, upload.single("media"), postController.createPost);



// Add a comment to a post
router.post("/:id/comment", authMiddleware, postController.addComment);

// 📌 Get All Reported Posts (Admin Only)
router.get("/reports", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reportedPosts = await Post.find({ "reports.0": { $exists: true } })
      .populate("user", "name profilePicture")
      .populate("reports.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reportedPosts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
