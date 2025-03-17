const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportType: { type: String, enum: ["post", "user"], required: true },
    reportedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
