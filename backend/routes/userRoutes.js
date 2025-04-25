const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcrypt");
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
router.post('/update-profile', authMiddleware, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fullName, username, department, year, semester, bio, skills, interests, portfolio, linkedin } = req.body;
    
    // Find user by ID from the authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle file uploads
    const updateData = {
      fullName: fullName || user.fullName,
      username: username || user.username,
      department: department || user.department,
      year: year || user.year,
      semester: semester || user.semester,
      bio: bio || user.bio,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : user.skills,
      interests: interests ? interests.split(',').map(interest => interest.trim()) : user.interests,
      socialLinks: {
        ...user.socialLinks,
        portfolio: portfolio || user.socialLinks?.portfolio,
        linkedin: linkedin || user.socialLinks?.linkedin
      }
    };

    // Add avatar and banner if uploaded
    if (req.files) {
      if (req.files.avatar) {
        updateData.avatar = `/uploads/${req.files.avatar[0].filename}`;
      }
      if (req.files.banner) {
        updateData.banner = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        department: updatedUser.department,
        year: updatedUser.year,
        semester: updatedUser.semester,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        socialLinks: updatedUser.socialLinks,
        avatar: updatedUser.avatar,
        banner: updatedUser.banner,
        rollNumber: updatedUser.rollNumber
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by roll number
router.get("/profile/:rollNo", async (req, res) => {
  try {
    console.log("Fetching profile for rollNo:", req.params.rollNo);
    
    const user = await User.findOne({ rollNo: req.params.rollNo });
    if (!user) {
      console.log("User not found with rollNo:", req.params.rollNo);
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

// Login route
router.post('/login', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;
        console.log("Login attempt with rollNumber:", rollNumber);

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
        req.session.userId = user.rollNumber;

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
            banner: user.banner || '/assets/images/default-banner.jpg'
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

// Get authenticated user's profile
router.get("/my-profile", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching authenticated user profile for ID:", req.user.id);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("User not found with ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    // Return complete profile data for authenticated user
    res.status(200).json({
      fullName: user.fullName,
      username: user.username,
      rollNumber: user.rollNumber,
      email: user.email,
      department: user.department,
      year: user.year,
      semester: user.semester,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      portfolio: user.socialLinks?.portfolio,
      linkedin: user.socialLinks?.linkedin,
      avatar: user.avatar || '/assets/images/default-avatar.png',
      banner: user.banner || '/assets/images/default-banner.jpg',
      socialLinks: user.socialLinks || {}
    });
  } catch (error) {
    console.error("Error fetching authenticated profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password route
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const rollNo = req.user.rollNo;

    if (!rollNo) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findOne({ rollNo });
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

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await User.findOneAndUpdate(
      { rollNo },
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