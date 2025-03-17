const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" }, // Image URL (Cloudinary support if needed)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of users who liked the post

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users mentioned in the post

    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, required: true },
        resolved: { type: Boolean, default: false }, // Mark if the report is addressed
        actionTaken: { 
          type: String, 
          enum: ["none", "warning", "post_deleted", "user_banned"], 
          default: "none" 
        }, // Admin action on report
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
