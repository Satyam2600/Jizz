const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true }, // Added Roll No. (UID)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" }, // Deprecated, replaced by avatar
    avatar: { type: String, default: "/assets/images/default-avatar.jpg" }, // Profile photo
    banner: { type: String, default: "/assets/images/default-banner.jpg" }, // Banner photo
    badges: [{ type: String }], // Gamification badges
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    role: { type: String, enum: ["user", "admin"], default: "user" }, // Admin Control
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);