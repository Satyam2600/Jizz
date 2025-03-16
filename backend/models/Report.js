const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportedContent: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Reviewed", "Action Taken"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
