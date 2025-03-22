const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// 📌 Step 1: Request Password Reset
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate Email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate Reset Token (valid for 1 hour)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Reset Link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send Email
    await sendEmail(user.email, "Password Reset", `Click here to reset your password: ${resetLink}`);

    res.status(200).json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error("Error in /request-reset:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Step 2: Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate Input
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and New Password are required" });
    }

    // Verify Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find User
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error in /reset-password:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
