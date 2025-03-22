const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { fullName, uid, email, password } = req.body;

        if (!fullName || !uid || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Save user to database (example, replace with actual DB logic)
        const newUser = { fullName, uid, email, password }; // ⚠ Hash password in real apps

        console.log("✅ User Registered:", newUser);
        return res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("❌ Server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router; // ✅ Export routes
