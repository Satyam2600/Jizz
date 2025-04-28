// backend/routes/passwordresetRoutes.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const router = express.Router();

// Request password reset
router.post("/request-reset", async (req, res) => {
  try {
    const { rollNo } = req.body;
    if (!rollNo) {
      return res.status(400).json({ message: "Roll number is required" });
    }

    console.log("Roll number received:", rollNo);

    // Find the user by rollNo
    const user = await User.findOne({ rollNumber: rollNo });
    console.log("User found:", user);

    if (!user) {
      console.log("No user found with rollNo:", rollNo);
      return res.status(404).json({ message: "No account found with the provided roll number" });
    }

    if (!user.email) {
      console.log("User found but email is missing");
      return res.status(400).json({ message: "No email associated with this account" });
    }

    // Generate a new random password
    const newPassword = crypto.randomBytes(5).toString("hex");
    console.log("Generated new password:", newPassword);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    // Send the email
    const htmlContent = `
      <h2>Password Reset</h2>
      <p>Hello ${user.fullName || 'User'},</p>
      <p>Your password has been reset. Your new password is: <strong>${newPassword}</strong></p>
      <p>Please log in using this password and change it immediately for security.</p>
      <p>If you did not request this password reset, please contact support immediately.</p>
    `;

    await sendEmail(user.email, "Your New Password", htmlContent);

    res.status(200).json({
      message: "A new password has been sent to your registered email.",
      success: true
    });
  } catch (error) {
    console.error("Error in /request-reset:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
