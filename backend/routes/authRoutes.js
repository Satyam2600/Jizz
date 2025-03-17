const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 📌 Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, uid, password } = req.body;

    // Check if email or UID already exists
    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
    if (existingUser) return res.status(400).json({ message: "Email or UID already exists" });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, uid, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Login User (Allow UID or Email)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // Identifier can be UID or Email

    // Find user by UID or Email
    const user = await User.findOne({ $or: [{ email: identifier }, { uid: identifier }] });
    if (!user) return res.status(400).json({ message: "Invalid UID/Email or Password" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid UID/Email or Password" });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
