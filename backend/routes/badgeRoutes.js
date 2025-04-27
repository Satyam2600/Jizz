const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Badge = require("../models/Badge");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const badgeController = require("../controllers/badgeController");

const router = express.Router();

// Get All Badges
router.get("/", authenticate, badgeController.getAllBadges);

// Get user's badges
router.get("/user", authenticate, badgeController.getUserBadges);

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

// Assign a badge to a user
router.post("/award", authenticate, adminMiddleware, badgeController.awardBadge);

// Remove badge from user
router.delete("/:badgeId", authenticate, badgeController.removeBadge);

module.exports = router;  // ✅ Correct for Express routes
module.exports.assignBadge = assignBadge; // ✅ Export the function separately

