const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 📌 Register a New User
router.post("/register", async (req, res) => {
  try {
    const { fullName, uid, email, password } = req.body;

    if (!fullName || !uid || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { rollNo: uid }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or UID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: fullName,
      rollNo: uid,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        rollNo: newUser.rollNo,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Error in /register:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 User Login
router.post("/login", async (req, res) => {
  try {
    const { uid, password } = req.body;

    if (!uid || !password) {
      return res.status(400).json({ message: "Roll No. and password are required" });
    }

    const user = await User.findOne({ rollNo: uid });
    if (!user) {
      return res.status(400).json({ message: "Invalid Roll No. or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Roll No. or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;