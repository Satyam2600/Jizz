const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const router = express.Router();

// 📌 Request Password Reset using UID (Generate Random Password)
router.post("/request-reset", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    // Find user by UID
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random password string (e.g., 10 hex characters)
    const newRandomPassword = crypto.randomBytes(5).toString("hex");
    console.log("Generated new password:", newRandomPassword);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newRandomPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Prepare email content with the new random password
    const htmlContent = `
      <h2>Password Reset</h2>
      <p>Your new password is: <strong>${newRandomPassword}</strong></p>
      <p>Please log in using this password and change it immediately for security.</p>
    `;

    // Send the new password to the registered email using Brevo
    await sendEmail(user.email, "Your New Password", htmlContent);

    res.status(200).json({ message: "A new password has been sent to your registered email." });
  } catch (error) {
    console.error("Error in /request-reset:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
