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

// 📌 Update Profile (Prevent Roll No. Change)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, profilePicture, bio } = req.body;

    // Prevent Roll No. modification
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, profilePicture, bio },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Get User by Roll No.
router.get("/user/:rollNo", authMiddleware, async (req, res) => {
  try {
    const { rollNo } = req.params;
    const user = await User.findOne({ rollNo }).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
