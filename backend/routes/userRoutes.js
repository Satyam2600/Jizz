const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const jwt = require('jsonwebtoken');

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

// Get user profile (for edit profile page, protected)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile by roll number
router.get("/profile/:rollNumber", async (req, res) => {
  try {
    console.log("Fetching profile for rollNumber:", req.params.rollNumber);
    const user = await User.findOne({ rollNumber: req.params.rollNumber });
    if (!user) {
      console.log("User not found with rollNumber:", req.params.rollNumber);
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      rollNumber: user.rollNumber,
      department: user.department,
      year: user.year,
      semester: user.semester,
      bio: user.bio,
      skills: Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()) : []),
      interests: Array.isArray(user.interests) ? user.interests : (user.interests ? user.interests.split(',').map(i => i.trim()) : []),
      portfolio: user.portfolio || '',
      linkedin: user.linkedin || '',
      avatar: user.avatar || '/assets/images/default-avatar.png',
      banner: user.banner || '/assets/images/default-banner.jpg',
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;
        console.log("Login attempt with rollNumber:", rollNumber);
    console.log("Login attempt with password:", password);

        // Find user by rollNumber
        const user = await User.findOne({ rollNumber });
        
        if (!user) {
            console.log("User not found with rollNumber:", rollNumber);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log("Password mismatch for user:", rollNumber);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user._id;
        req.session.user = {
            _id: user._id,
            username: user.username || user.rollNumber,
            rollNumber: user.rollNumber,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar || '/assets/images/default-avatar.png',
            banner: user.banner || '/assets/images/default-banner.jpg',
            profileCompleted: user.profileCompleted
        };

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, rollNumber: user.rollNumber },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data
        const userData = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            rollNumber: user.rollNumber,
            username: user.username || user.rollNumber,
            avatar: user.avatar || '/assets/images/default-avatar.png',
            banner: user.banner || '/assets/images/default-banner.jpg',
            profileCompleted: user.profileCompleted
        };

        // Return user data including isFirstLogin flag and token
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: userData
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get authenticated user's profile (for edit profile page, used by editProfile.js)
router.get('/my-profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      rollNumber: user.rollNumber,
      department: user.department,
      year: user.year,
      semester: user.semester,
      bio: user.bio,
      skills: Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()) : []),
      interests: Array.isArray(user.interests) ? user.interests : (user.interests ? user.interests.split(',').map(i => i.trim()) : []),
      portfolio: user.portfolio || '',
      linkedin: user.linkedin || '',
      avatar: user.avatar || '/assets/images/default-avatar.png',
      banner: user.banner || '/assets/images/default-banner.jpg',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (edit profile form submission, used by editProfile.js)
router.post('/update-profile', authenticate, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.fullName = data.fullName || user.fullName;
    user.username = data.username || user.username;
    user.email = data.email || user.email;
    user.rollNumber = data.rollNumber || user.rollNumber;
    user.department = data.department || user.department;
    user.year = data.year || user.year;
    user.semester = data.semester || user.semester;
    user.bio = data.bio || user.bio;
    // Accept both comma-separated string and array for skills/interests
    if (data.skills) {
      user.skills = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills;
    }
    if (data.interests) {
      user.interests = Array.isArray(data.interests) ? data.interests.join(', ') : data.interests;
    }
    user.portfolio = data.portfolio || user.portfolio;
    user.linkedin = data.linkedin || user.linkedin;
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      user.avatar = `/uploads/${req.files.avatar[0].filename}`;
    }
    if (req.files && req.files.banner && req.files.banner[0]) {
      user.banner = `/uploads/${req.files.banner[0].filename}`;
    }
    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        rollNumber: user.rollNumber,
        department: user.department,
        year: user.year,
        semester: user.semester,
        bio: user.bio,
        skills: Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()) : []),
        interests: Array.isArray(user.interests) ? user.interests : (user.interests ? user.interests.split(',').map(i => i.trim()) : []),
        portfolio: user.portfolio || '',
        linkedin: user.linkedin || '',
        avatar: user.avatar || '/assets/images/default-avatar.png',
        banner: user.banner || '/assets/images/default-banner.jpg',
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password route
router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const rollNumber = req.user.rollNumber;
    if (!rollNumber) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findOne({ rollNumber }).select('+password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }
    user.password = newPassword;
    await user.save();
    console.log('Password after change (should be hash):', user.password);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;