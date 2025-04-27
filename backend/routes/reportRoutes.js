const express = require("express");
const Report = require("../models/Report");
const Post = require("../models/Post");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const reportController = require("../controllers/reportController");

const router = express.Router();

// 📌 Report a Post or User
router.post("/", authenticate, async (req, res) => {
  try {
    const { reportType, reportedPost, reportedUser, reason } = req.body;

    if (!reportType || !reason) {
      return res.status(400).json({ message: "Report type and reason are required" });
    }

    const report = new Report({
      reportedBy: req.user.id,
      reportType,
      reportedPost: reportedPost || null,
      reportedUser: reportedUser || null,
      reason,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Get All Reports (Admin Only)
router.get("/", authenticate, adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("reportedPost", "content")
      .populate("reportedUser", "name email");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Update Report Status (Admin Only)
router.put("/:id", authenticate, adminMiddleware, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = "reviewed";
    await report.save();

    res.status(200).json({ message: "Report reviewed", report });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Delete Report (Admin Only)
router.delete("/:id", authenticate, adminMiddleware, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Report a post
router.post("/post/:postId", authenticate, reportController.reportPost);

// Report a user
router.post("/user/:userId", authenticate, reportController.reportUser);

// Handle a report (admin only)
router.put("/:reportId", authenticate, reportController.handleReport);

module.exports = router;
