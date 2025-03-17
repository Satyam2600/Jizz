const express = require("express");
const Report = require("../models/Report");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// 📌 Report a Post or User
router.post("/", authMiddleware, async (req, res) => {
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
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
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
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
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
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
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

module.exports = router;
