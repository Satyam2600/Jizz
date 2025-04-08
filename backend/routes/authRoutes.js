const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 📌 Register a New User
router.post("/register", async (req, res) => {
  try {
    const { fullName, uid, email, password } = req.body;

    // Validate required fields
    if (!fullName || !uid || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { rollNo: uid }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or UID already exists" });
    }

    // Hash the password
    console.log("Password before hashing:", password); // Debugging log
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword); // Debugging log

    // Create a new user
    const newUser = new User({
      fullName,
      rollNo: uid,
      email,
      password: hashedPassword, // Store the hashed password
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
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

    // Find the user by UID
    const user = await User.findOne({ rollNo: uid });
    if (!user) {
      return res.status(400).json({ message: "Invalid Roll No. or password" });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Roll No. or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
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

