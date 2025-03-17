const express = require("express");
const Report = require("../models/Report");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// 📌 Get All Reports (Admin Only)
router.get("/reports", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find().populate("reportedBy reportedPost reportedUser");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Review a Report
router.put("/reports/:id/review", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "reviewed", "action_taken"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Delete a Reported Post (Admin Only)
router.delete("/posts/:postId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Warn a User (Admin Only)
router.post("/users/:userId/warn", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.warnings = (user.warnings || 0) + 1;
    await user.save();

    res.status(200).json({ message: "User warned", warnings: user.warnings });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Ban a User (Admin Only)
router.post("/users/:userId/ban", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isBanned: true });
    res.status(200).json({ message: "User banned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Get Admin Dashboard Stats
router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const reviewedReports = await Report.countDocuments({ status: "reviewed" });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    res.status(200).json({ totalReports, pendingReports, reviewedReports, bannedUsers });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
