const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
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

// Get user's badges
router.get("/user-badges", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ rollNo: req.user.id }).populate("badges");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.badges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Assign a badge to a user
router.post("/assign", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    const user = await User.findOne({ rollNo: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const badge = await Badge.findById(badgeId);
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    if (!user.badges.includes(badge._id)) {
      user.badges.push(badge._id);
      await user.save();
    }

    res.status(200).json({ message: "Badge assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;  // ✅ Correct for Express routes
module.exports.assignBadge = assignBadge; // ✅ Export the function separately

