const express = require("express");
const Report = require("../models/Report");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Report a Post or User
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { reportType, reportedPost, reportedUser, reason } = req.body;
    if (!reportType || !reason) return res.status(400).json({ message: "Report type and reason are required" });
    const newReport = new Report({
      reportedBy: req.user.id,
      reportType,
      reportedPost,
      reportedUser,
      reason,
    });
    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
