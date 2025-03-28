const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// Get Own User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update Profile (Prevent Roll No. and Email Change)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    // Destructure new fields from request body.
    const {
      fullName,
      username,       // This will update rollNo if provided.
      department,
      bio,
      phone,
      github,
      linkedin,
      twitter,
      instagram,
      publicProfile,
      profilePicture, // Should be URL/path to new profile picture
      coverPhoto      // Should be URL/path to new cover photo
    } = req.body;

    // Build update object – only include fields if provided.
    const updateData = {};
    if (fullName) updateData.name = fullName;
    // Updating UID (username) if allowed.
    if (department) updateData.department = department;
    if (bio !== undefined) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    if (github) updateData.github = github;
    if (linkedin) updateData.linkedin = linkedin;
    if (twitter) updateData.twitter = twitter;
    if (instagram) updateData.instagram = instagram;
    if (publicProfile !== undefined) updateData.publicProfile = publicProfile;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (coverPhoto) updateData.coverPhoto = coverPhoto;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get User by Roll No.
router.get("/user/:rollNo", authMiddleware, async (req, res) => {
  try {
    const { rollNo } = req.params;
    const user = await User.findOne({ rollNo }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
