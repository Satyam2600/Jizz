const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const User = require("../models/User");
const userController = require("../controllers/userController");
const bcrypt = require("bcryptjs");
const { uploadProfile, uploadToCloudinary } = require("../middleware/uploadMiddleware");
const jwt = require('jsonwebtoken');

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
      skills: Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : []),
      interests: Array.isArray(user.interests) ? user.interests : (user.interests ? user.interests.split(',').map(i => i.trim()).filter(i => i.length > 0) : []),
      portfolio: user.portfolio || '',
      linkedin: user.linkedin || '',
      phoneNumber: user.phoneNumber || '',
      github: user.github || '',
      twitter: user.twitter || '',
      instagram: user.instagram || '',
      isPublic: user.isPublic !== undefined ? user.isPublic : true,
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
        const user = await User.findOne({ rollNumber }).select('+password');
        
        if (!user) {
            console.log("User not found with rollNumber:", rollNumber);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await user.matchPassword(password);
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
            { userId: user._id, rollNumber: user.rollNumber },
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
      skills: Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : []),
      interests: Array.isArray(user.interests) ? user.interests : (user.interests ? user.interests.split(',').map(i => i.trim()).filter(i => i.length > 0) : []),
      portfolio: user.portfolio || '',
      linkedin: user.linkedin || '',
      phoneNumber: user.phoneNumber || '',
      github: user.github || '',
      twitter: user.twitter || '',
      instagram: user.instagram || '',
      isPublic: user.isPublic !== undefined ? user.isPublic : true,
      avatar: user.avatar || '/assets/images/default-avatar.png',
      banner: user.banner || '/assets/images/default-banner.jpg',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile with Cloudinary upload
router.put('/profile', authenticate, uploadProfile, uploadToCloudinary, async (req, res) => {
  try {
    const { fullName, username, email, department, bio, phone } = req.body;
    
    // Get avatar URL from Cloudinary upload
    let avatarUrl = null;
    if (req.cloudinaryResult) {
      avatarUrl = req.cloudinaryResult.url;
    }

    const updateData = {
      fullName,
      username,
      email,
      department,
      bio,
      phone
    };

    // Only update avatar if a new one was uploaded
    if (avatarUrl) {
      updateData.avatar = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile (POST route for frontend compatibility)
router.post('/update-profile', authenticate, uploadProfile, uploadToCloudinary, async (req, res) => {
  try {
    const { 
      fullName, 
      username, 
      email, 
      rollNumber, 
      department, 
      year, 
      semester, 
      bio, 
      skills, 
      interests, 
      portfolio, 
      linkedin, 
      phoneNumber, 
      isPublic,
      github,
      twitter,
      instagram
    } = req.body;
    
    // Get avatar and banner URLs from Cloudinary upload
    let avatarUrl = null;
    let bannerUrl = null;
    
    // Handle single file upload (backward compatibility)
    if (req.cloudinaryResult) {
      avatarUrl = req.cloudinaryResult.url;
    }
    
    // Handle multiple files upload
    if (req.cloudinaryResults) {
      if (req.cloudinaryResults.avatar) {
        avatarUrl = req.cloudinaryResults.avatar.url;
      }
      if (req.cloudinaryResults.banner) {
        bannerUrl = req.cloudinaryResults.banner.url;
      }
    }

    const updateData = {
      fullName,
      username,
      email,
      rollNumber,
      department,
      year,
      semester,
      bio,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s.length > 0)) : undefined,
      interests: interests ? (Array.isArray(interests) ? interests : interests.split(',').map(i => i.trim()).filter(i => i.length > 0)) : undefined,
      portfolio,
      linkedin,
      phoneNumber,
      github,
      twitter,
      instagram
    };

    // Only update isPublic if it's provided
    if (typeof isPublic !== 'undefined') {
      updateData.isPublic = isPublic;
    }

    // Only update avatar if a new one was uploaded
    if (avatarUrl) {
      updateData.avatar = avatarUrl;
    }
    
    // Only update banner if a new one was uploaded
    if (bannerUrl) {
      updateData.banner = bannerUrl;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
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

// Add follow/unfollow routes
router.post('/:id/follow', authenticate, userController.followUser);
router.post('/:id/unfollow', authenticate, userController.unfollowUser);

// Get all users (for chat list)
router.get('/all', authenticate, async (req, res) => {
  try {
    const users = await User.find({}, 'fullName username avatar rollNumber _id').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;