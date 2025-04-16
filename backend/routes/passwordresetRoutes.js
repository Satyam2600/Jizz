// backend/routes/passwordresetRoutes.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const router = express.Router();

// POST /api/password-reset/request-reset
// Accepts a UID, checks if a user exists, generates a new random password, updates the user record, and sends the new password via email.
router.post("/request-reset", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: "UID is required" });

    console.log("UID received:", uid);

    // Find the user by rollNo
    const user = await User.findOne({ rollNo: uid });
    console.log("User found:", user);

    if (!user) {
      console.log("No user found with rollNo:", uid);
      return res.status(404).json({ message: "No account found with the provided roll number" });
    }

    const email = user.email;

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
      <p>Your new password is: <strong>${newPassword}</strong></p>
      <p>Please log in using this password and change it immediately for security.</p>
    `;
    await sendEmail(email, "Your New Password", htmlContent);

    res.status(200).json({
      message: "A new password has been sent to your registered email.",
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("Error in /request-reset:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
module.exports = router;
