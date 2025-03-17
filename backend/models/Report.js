const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who reported

    reportType: { 
      type: String, 
      enum: ["post", "user"], 
      required: true 
    }, // Determines if a post or user is being reported

    reportedPost: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Post", 
      required: function () { return this.reportType === "post"; } 
    }, // Required if reportType is 'post'

    reportedUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: function () { return this.reportType === "user"; } 
    }, // Required if reportType is 'user'

    reason: { type: String, required: true }, // Reason for reporting

    status: { 
      type: String, 
      enum: ["pending", "reviewed", "action_taken"], 
      default: "pending" 
    }, // Status tracking of report

    actionTaken: { 
      type: String, 
      enum: ["none", "warning", "post_deleted", "user_banned"], 
      default: "none" 
    }, // Admin decision on the report

    reviewedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Admin who reviewed the report (optional)

    resolvedAt: { type: Date }, // Timestamp when report is resolved
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

module.exports = Report;
