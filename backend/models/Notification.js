const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g., like, comment, mention, message, group invite, event update
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who triggered the notification
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // related post (optional)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
