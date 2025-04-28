const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
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
router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { content } = req.body;
      let image = null;
      let video = null;
      if (req.files && req.files.image && req.files.image[0]) {
        image = req.files.image[0].filename;
      }
      if (req.files && req.files.video && req.files.video[0]) {
        video = req.files.video[0].filename;
      }
      console.log("content", content);
      if (!content && !image && !video) return res.status(400).json({ message: "Post content is required" });

      // Extract mentioned usernames from content (@username)
      const mentionedUsernames = content ? content.match(/@(\w+)/g) : [];
      const mentionedUsers = [];
      for (let username of mentionedUsernames || []) {
        const user = await User.findOne({ username: username.replace("@", "") }).select("_id");
        if (user) mentionedUsers.push(user._id);
      }
      const newPost = new Post({
        user: req.user.id,
        content: content || '',
        image,
        video,
        mentions: mentionedUsers, // Store mentioned users
      });
      await newPost.save();
      res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
);

// 📌 Get All Posts (Latest First)
router.get("/", authenticate, postController.getAllPosts); // Always returns all posts with user info, paginated if query params provided

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
router.post("/:id/like", authenticate, postController.toggleLike);

// 📌 Delete a Post (Only Owner Can Delete)
router.delete("/:id", authenticate, postController.deletePost);

// 📌 Report a Post
router.post("/:id/report", authenticate, postController.reportPost);

// Create a new post
router.post("/create", authenticate, upload.single("media"), postController.createPost);



// Add a comment to a post
router.post("/:id/comment", authenticate, postController.addComment);

// 📌 Get All Reported Posts (Admin Only)
router.get("/reports", authenticate, adminMiddleware, async (req, res) => {
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
