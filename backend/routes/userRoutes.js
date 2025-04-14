const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.post("/update-profile", authMiddleware, upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]), async (req, res) => {
  try {
    const updateFields = {
      fullName: req.body.fullName,
      username: req.body.username,
      bio: req.body.bio,
      skills: req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : [],
      interests: req.body.interests ? req.body.interests.split(',').map(interest => interest.trim()) : [],
      socialLinks: {
        linkedin: req.body.linkedin,
        github: req.body.github,
        twitter: req.body.twitter,
        instagram: req.body.instagram
      },
      department: req.body.department,
      year: req.body.year,
      semester: req.body.semester,
      phoneNumber: req.body.phoneNumber,
      isPublic: req.body.isPublic === 'true'
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.avatar) {
        updateFields.avatar = `/uploads/${req.files.avatar[0].filename}`;
      }
      if (req.files.banner) {
        updateFields.banner = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to fetch user profile
router.get("/get-profile", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findOne({ rollNo: userId });

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.fullName,
        username: user.username || user.rollNo,
        rollNo: user.rollNo,
        avatar: user.avatar || '/assets/images/default-avatar.jpg',
        banner: user.banner || '/assets/images/default-banner.jpg',
        department: user.department,
        year: user.year,
        semester: user.semester,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        portfolio: user.portfolio,
        phoneNumber: user.phoneNumber,
        socialLinks: {
          github: user.github,
          linkedin: user.linkedin,
          twitter: user.twitter,
          instagram: user.instagram
        }
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { uid, password } = req.body;
    console.log("Login attempt with uid:", uid);
    
    // Find user by rollNo (which is stored as uid in the database)
    const user = await User.findOne({ rollNo: uid });
    
    if (!user) {
      console.log("User not found with rollNo:", uid);
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password using the User model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", uid);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set user session
    req.session.userId = user.rollNo;
    req.session.isAuthenticated = true;

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, rollNo: user.rollNo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data including isFirstLogin flag and token
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        uid: user.rollNo,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
        banner: user.banner,
        isFirstLogin: user.isFirstLogin
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile data
router.get("/profile/:rollNumber", async (req, res) => {
  try {
    console.log("Fetching profile for rollNumber:", req.params.rollNumber);
    
    const user = await User.findOne({ rollNumber: req.params.rollNumber });
    if (!user) {
      console.log("User not found with rollNumber:", req.params.rollNumber);
      return res.status(404).json({ message: "User not found" });
    }

    // Return public profile data
    res.status(200).json({
      fullName: user.fullName,
      username: user.username,
      department: user.department,
      year: user.year,
      semester: user.semester,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      portfolio: user.socialLinks?.portfolio,
      linkedin: user.socialLinks?.linkedin,
      avatar: user.avatar || '/assets/images/default-avatar.png',
      banner: user.banner || '/assets/images/default-banner.jpg'
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get authenticated user's profile
router.get("/my-profile", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching authenticated user profile for ID:", req.user.userId);
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log("User not found with ID:", req.user.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Return complete profile data for authenticated user
    res.status(200).json({
      fullName: user.fullName,
      username: user.username,
      rollNumber: user.rollNumber,
      department: user.department,
      year: user.year,
      semester: user.semester,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      portfolio: user.socialLinks?.portfolio,
      linkedin: user.socialLinks?.linkedin,
      avatar: user.avatar || '/assets/images/default-avatar.png',
      banner: user.banner || '/assets/images/default-banner.jpg'
    });
  } catch (error) {
    console.error("Error fetching authenticated profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password route
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const uid = req.session.userId;

    if (!uid) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findOne({ rollNo: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password using bcrypt directly
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update only the password field using findOneAndUpdate
    await User.findOneAndUpdate(
      { rollNo: uid },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;