const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// 📌 Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Update Profile (Prevent UID Change)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, profilePicture } = req.body;

    // Prevent UID modification
    const updatedUser = await User.findByIdAndUpdate(req.user.id, 
      { name, profilePicture }, 
      { new: true }
    );

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
