const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const router = express.Router();

// POST /api/password-reset/request-reset
// Generates a reset token, updates the user's document, and sends a new password via email.
router.post("/request-reset", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: "UID is required" });

    // Find user by UID
    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ message: "User not found" });

    const email = user.email; // Get the registered email

    // Generate a new random password (for example, a 10-character hex string)
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
      <p>Please log in using this password and change it immediately for security.</p>
    `;

    // Send email with the new password using Brevo
    await sendEmail(email, "Your New Password", htmlContent);

    res.status(200).json({ message: "A new password has been sent to your registered email." });
  } catch (error) {
    console.error("Error in /request-reset:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// (Optional) You can add another endpoint for token-based reset if needed

module.exports = router;
