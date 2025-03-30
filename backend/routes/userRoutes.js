const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Update user profile
router.post("/update-profile", async (req, res) => {
  try {
    const { userId, fullName, username, department, bio, phoneNumber, github, linkedin, twitter, instagram } = req.body;

    // Find the user and update their profile
    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, username, department, bio, phoneNumber, github, linkedin, twitter, instagram },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;