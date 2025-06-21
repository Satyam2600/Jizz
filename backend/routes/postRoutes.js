const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware"); // For admin-only actions
const { uploadPost, uploadToCloudinary, upload } = require("../middleware/uploadMiddleware");
const mongoose = require('mongoose');
const postController = require("../controllers/postController");

const router = express.Router();

// Create a new post with Cloudinary upload
router.post(
  "/",
  authenticate,
  uploadPost,
  uploadToCloudinary,
  postController.createPost
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
