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
    // const existingUser = await User.findOne({ 
    //   $or: [
    //     { email },
    //     // { rollNumber }
    //   ]
    // });
    // if (existingUser) {
    //   return res.status(400).json({ message: "User already exists with this email or roll number" });
    // }

    console.log(rollNumber)

    // Create new user - password will be hashed by the pre-save hook
    const user = new User({
      fullName,
      email,
      rollNumber,
      password // Password will be hashed by the pre-save hook
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
    
    // Validate input
    if (!rollNumber || !password) {
      return res.status(400).json({ message: 'Roll number and password are required' });
    }

    // Clean the roll number (trim whitespace and convert to string)
    const cleanRollNumber = String(rollNumber).trim();

    // Debug logging
    console.log('Login attempt with rollNumber:', cleanRollNumber);

    // Find user by rollNumber and explicitly select the password field
    const user = await User.findOne({ rollNumber: cleanRollNumber }).select('+password');
    
    // Debug logging
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('No user found with rollNumber:', cleanRollNumber);
      return res.status(401).json({ message: 'Invalid roll number or password' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', cleanRollNumber);
      return res.status(401).json({ message: 'Invalid roll number or password' });
    }

    // Generate unique JWT token with timestamp
    const token = jwt.sign(
      { 
        id: user._id,
        rollNumber: user.rollNumber,
        role: user.role,
        iat: Math.floor(Date.now() / 1000) // Add issued at timestamp
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1d',
        algorithm: 'HS256' // Explicitly specify algorithm
      }
    );

    // Log successful login
    console.log(`User ${user.rollNumber} logged in successfully`);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        rollNumber: user.rollNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error logging in", error: error.message });
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
    
    // Clean and convert rollNumber to string
    const cleanRollNumber = String(rollNumber).trim();
    
    // Debug log
    console.log('Looking for user with roll number:', cleanRollNumber);
    
    // Find user by roll number
    const user = await User.findOne({ rollNumber: cleanRollNumber });
    
    // Debug log
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('No user found with roll number:', cleanRollNumber);
      return res.status(404).json({ message: 'No account found with the provided roll number' });
    }
    
    if (!user.email) {
      console.log('User found but email is missing');
      return res.status(400).json({ message: 'No email associated with this account' });
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
    
    await sendEmail(user.email, "Your New Password", htmlContent);
    
    console.log(`Password reset completed for user: ${user.fullName || user.rollNumber} (${user.rollNumber})`);
    
    res.status(200).json({ 
      message: 'Password reset instructions have been sent to your email.',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

