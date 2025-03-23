const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { fullName, uid, email, password } = req.body;

        if (!fullName || !uid || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        console.log("✅ User Registered:", { fullName, uid, email, password });
        return res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("❌ Server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router; // ✅ Export the router
