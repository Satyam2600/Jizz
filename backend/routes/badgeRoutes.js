const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Badge = require("../models/Badge");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const router = express.Router();

// Get All Badges
router.get("/", async (req, res) => {
  try {
    const badges = await Badge.find();
    res.status(StatusCodes.OK).json(badges);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error });
  }
});

// Assign Badge to User (Internal Function)
const assignBadge = async (userId, badgeName) => {
  try {
    const user = await User.findById(userId);
    const badge = await Badge.findOne({ name: badgeName });

    if (user && badge && !user.badges.includes(badge._id)) {
      user.badges.push(badge._id);
      await user.save();
    }
  } catch (error) {
    console.error("Error assigning badge:", error);
  }
};

// Get User Badges
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("badges");
    res.status(200).json(user.badges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = { router, assignBadge };
