// backend/routes/passwordresetRoutes.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const router = express.Router();

// POST /api/password-reset/request-reset
// This endpoint accepts a UID (rollNo), validates if a user exists,
// generates a new random password, hashes it, updates the user record,
// and sends the new password to the user's registered email.
router.post("/request-reset", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    // Find user by UID (assuming your User model stores it as rollNo)
    const user = await User.findOne({ rollNo: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new random password (e.g., 10-character hex string)
    const newPassword = crypto.randomBytes(5).toString("hex");
    console.log("Generated new password:", newPassword);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Compose email content with the new password
    const htmlContent = `
      <h2>Password Reset</h2>
      <p>Your new password is: <strong>${newPassword}</strong></p>
      <p>Please log in with this password and change it immediately for security.</p>
    `;

    // Send email to the user's registered email using Brevo
    await sendEmail(user.email, "Your New Password", htmlContent);

    res.status(200).json({ message: "A new password has been sent to your registered email." });
  } catch (error) {
    console.error("Error in /request-reset:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
