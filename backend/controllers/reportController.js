const Report = require("../models/Report");
const Post = require("../models/Post");
const User = require("../models/User");

exports.reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const report = new Report({
      reportedBy: req.user.id,
      reportedPost: postId,
      reason,
      type: "post"
    });

    await report.save();
    res.status(201).json({ message: "Post reported successfully", report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reportUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const report = new Report({
      reportedBy: req.user.id,
      reportedUser: userId,
      reason,
      type: "user"
    });

    await report.save();
    res.status(201).json({ message: "User reported successfully", report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.handleReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, adminNote } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = "reviewed";
    report.adminNote = adminNote;
    report.action = action;
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();

    await report.save();

    // Take action based on the report type and action
    if (action === "delete" && report.type === "post") {
      await Post.findByIdAndDelete(report.reportedPost);
    } else if (action === "warn" && report.type === "user") {
      const user = await User.findById(report.reportedUser);
      user.warnings = (user.warnings || 0) + 1;
      await user.save();
    } else if (action === "ban" && report.type === "user") {
      await User.findByIdAndUpdate(report.reportedUser, { isBanned: true });
    }

    res.json({ message: "Report handled successfully", report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "username")
      .populate("reportedUser", "username")
      .populate("reportedPost", "content")
      .populate("reviewedBy", "username")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 