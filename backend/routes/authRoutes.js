const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 📌 Register a New User
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, rollNo } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !rollNo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { rollNo }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or roll number" });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      rollNo
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully. Please login to continue.",
      success: true
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// 📌 User Login
router.post("/login", async (req, res) => {
  try {
    const { rollNo, password } = req.body;
    const user = await User.findOne({ rollNo });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if this is first login (no username or profile photo set)
    const isFirstLogin = !user.username || !user.avatar;

    const token = jwt.sign(
      { userId: user._id, rollNo: user.rollNo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      rollNo: user.rollNo,
      avatar: user.avatar,
      banner: user.banner,
      isFirstLogin: isFirstLogin
    };

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 User Logout
router.post("/logout", (req, res) => {
  try {
    // Clear the session
    req.session.destroy();
    
    // Clear the session cookie
    res.clearCookie('connect.sid');
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    try {
        const { rollNo } = req.body;
        
        if (!rollNo) {
            return res.status(400).json({ message: 'Roll number is required' });
        }
        
        // Find user by roll number
        const user = await User.findOne({ rollNo });
        
        if (!user || !user.email) {
            return res.status(404).json({ 
                message: 'No account found with this roll number or email is missing',
                success: false
            });
        }

        // Generate a random password (8 characters)
        const crypto = require('crypto');
        const newPassword = crypto.randomBytes(4).toString('hex');
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update the user's password
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );
        
        // Send email with the new password
        const sendEmail = require('../utils/emailService');
        const htmlContent = `
            <h2>Password Reset</h2>
            <p>Hello ${user.fullName || 'User'},</p>
            <p>Your password has been reset. Your new password is: <strong>${newPassword}</strong></p>
            <p>Please log in using this password and change it immediately for security.</p>
            <p>If you did not request this password reset, please contact support immediately.</p>
        `;
        
        try {
            await sendEmail(user.email, "Your New Password", htmlContent);
            res.status(200).json({ 
                message: 'Password reset instructions have been sent to your email.',
                success: true
            });
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            res.status(500).json({ 
                message: 'Failed to send password reset email. Please try again later.',
                success: false
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            message: 'An error occurred while processing your request',
            success: false
        });
    }
});

module.exports = router;

