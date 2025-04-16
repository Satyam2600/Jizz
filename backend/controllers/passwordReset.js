const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const bcrypt = require("bcryptjs");

const requestPasswordReset = async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) return res.status(400).json({ error: "UID is required" });

        const user = await User.findOne({ rollNo: uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.tokenExpiry = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Send reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await sendEmail(user.email, "Password Reset", `Click here to reset: ${resetLink}`);

        res.json({ success: true, message: "Reset link sent to email" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ error: "Invalid request" });

        const user = await User.findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { requestPasswordReset, resetPassword };
