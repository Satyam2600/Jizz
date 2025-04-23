const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 📌 Register a New User
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, rollNumber } = req.body;
    
    // Debug logging
    console.log("Registration request received:", {
      fullName,
      email,
      rollNumber,
      hasPassword: !!password // Log if password exists without exposing it
    });

    // Validate required fields
    if (!fullName || !email || !password || !rollNumber) {
      console.log("Missing fields:", {
        fullName: !fullName,
        email: !email,
        password: !password,
        rollNumber: !rollNumber
      });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or roll number" });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      rollNumber
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
    const { rollNumber, password } = req.body;
    
    // Debug logging
    console.log("Login attempt received:", {
      rollNumber,
      hasPassword: !!password
    });

    // Find user by rollNumber
    const user = await User.findOne({ rollNumber });
    
    if (!user) {
      console.log("No user found with rollNumber:", rollNumber);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", rollNumber);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if this is first login (no username or profile photo set)
    const isFirstLogin = !user.username || !user.avatar;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, rollNumber: user.rollNumber },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      rollNumber: user.rollNumber,
      avatar: user.avatar,
      banner: user.banner,
      isFirstLogin: isFirstLogin
    };

    console.log("Login successful for user:", userData.rollNumber);
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
      const { rollNumber } = req.body;
      
      if (!rollNumber) {
          return res.status(400).json({ message: 'Roll number is required' });
      }
      
      // Find user by roll number
      const user = await User.findOne({ rollNumber });
      
      // For security reasons, we don't reveal whether a user exists or not
      // Instead, we always return a success message
      res.status(200).json({ 
          message: 'If an account exists with the provided roll number, password reset instructions will be sent.',
          success: true
      });
      
      // If user exists, generate a random password and send it via email
      if (user && user.email) {
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
          
          await sendEmail(user.email, "Your New Password", htmlContent);
          
          console.log(`Password reset completed for user: ${user.fullName || user.rollNumber} (${user.rollNumber})`);
      } else if (user) {
          console.error('User found but email is missing:', user);
      }
  } catch (error) {
      console.error('Forgot password error:', error);
      // Don't send a response here since we already sent one above
  }
});
module.exports = router;

