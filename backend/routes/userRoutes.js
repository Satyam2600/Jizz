const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Update user profile
router.post("/update-profile", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      username,
      department,
      year,
      semester,
      bio,
      skills,
      interests,
      portfolio,
      phoneNumber,
      linkedin,
      github,
      twitter,
      instagram,
    } = req.body;

    // Get the user ID from either the session or the request body
    const userIdentifier = req.session.userId || userId;
    
    if (!userIdentifier) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Find the user by rollNo
    const user = await User.findOne({ rollNo: userIdentifier });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    const updateData = {
      fullName: fullName || user.fullName,
      username: username || user.username,
      department: department || user.department,
      year: year || user.year,
      semester: semester || user.semester,
      bio: bio || user.bio,
      skills: skills ? skills.split(",").map(skill => skill.trim()) : user.skills,
      interests: interests ? interests.split(",").map(interest => interest.trim()) : user.interests,
      portfolio: portfolio || user.portfolio,
      phoneNumber: phoneNumber || user.phoneNumber,
      "socialLinks.linkedin": linkedin || user.socialLinks.linkedin,
      "socialLinks.github": github || user.socialLinks.github,
      "socialLinks.twitter": twitter || user.socialLinks.twitter,
      "socialLinks.instagram": instagram || user.socialLinks.instagram,
      isFirstLogin: false
    };

    // Handle file uploads if present
    if (req.files) {
      if (req.files.avatar) {
        updateData.avatar = req.files.avatar[0].path;
      }
      if (req.files.banner) {
        updateData.banner = req.files.banner[0].path;
      }
    }

    // Use findOneAndUpdate instead of save to avoid versioning issues
    const updatedUser = await User.findOneAndUpdate(
      { rollNo: userIdentifier },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
router.get("/profile/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ rollNo: req.params.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      fullName: user.fullName,
      username: user.username,
      department: user.department,
      year: user.year,
      semester: user.semester,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      portfolio: user.portfolio,
      avatar: user.avatar,
      banner: user.banner,
      phoneNumber: user.phoneNumber,
      socialLinks: user.socialLinks
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
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