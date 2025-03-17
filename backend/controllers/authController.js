const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// User Registration
exports.register = async (req, res) => {
  try {
    const { name, rollNo, email, password, branch, year, semester } = req.body;

    // Check if UID/Roll No. already exists
    const existingUser = await User.findOne({ rollNo });
    if (existingUser) return res.status(400).json({ message: "Roll No. already registered" });

    // Check if Email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      rollNo,
      email,
      password: hashedPassword,
      branch,
      year,
      semester,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// User Login (By Roll No. or Email)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Check if the user exists (by rollNo or email)
    const user = await User.findOne({
      $or: [{ rollNo: identifier }, { email: identifier }],
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token, user });

  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};
