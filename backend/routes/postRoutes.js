const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware"); // For admin-only actions

const router = express.Router();

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
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePicture")
      .populate("mentions", "name username profilePicture") // Fetch mentioned users
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

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
router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
      await post.save();
      return res.status(200).json({ message: "Post unliked", likes: post.likes.length });
    } else {
      post.likes.push(req.user.id);
      await post.save();
      return res.status(200).json({ message: "Post liked", likes: post.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Delete a Post (Only Owner Can Delete)
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized to delete this post" });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Report a Post
router.post("/report/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!reason) return res.status(400).json({ message: "Report reason is required" });

    post.reports.push({ user: req.user.id, reason });
    await post.save();

    res.status(200).json({ message: "Post reported successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

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
