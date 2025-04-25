const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// User Registration
exports.register = async (req, res) => {
  try {
    const { name, rollNumber, email, password, branch, year, semester } = req.body;

    // Validate required fields
    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ rollNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      rollNumber,
      email,
      password: hashedPassword,
      branch,
      year,
      semester
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// User Login (By Roll No. or Email)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Debug logging
    console.log('Login attempt:', { identifier });

    // Check if the user exists (by rollNumber or email)
    const user = await User.findOne({
      $or: [{ rollNumber: identifier }, { email: identifier }],
    });

    // Debug logging
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with identifier:', identifier);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password using the model's method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', user.rollNumber);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.rollNumber, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ 
      message: "Login successful", 
      token, 
      user: {
        rollNumber: user.rollNumber,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      } 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
