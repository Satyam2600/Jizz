const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Report = require("../models/Report");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Get All Users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🔹 Ban / Unban User
router.put("/users/ban/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = !user.isBanned;
    await user.save();
    res.status(200).json({ message: `User ${user.isBanned ? "banned" : "unbanned"} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🔹 Get All Reported Posts
router.get("/reports/posts", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find().populate("postId userId", "content username");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🔹 Delete Reported Post
router.delete("/posts/:postId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await Report.deleteMany({ postId: req.params.postId }); // Remove related reports
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🔹 Resolve Report (Without Deleting Post)
router.delete("/reports/:reportId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json({ message: "Report resolved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
