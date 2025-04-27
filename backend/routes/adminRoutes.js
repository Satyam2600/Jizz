const express = require("express");
const Report = require("../models/Report");
const Post = require("../models/Post");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// 📌 Get All Reports (Admin Only)
router.get("/reports", authenticate, adminController.getAllReports);

// 📌 Review a Report
router.put("/reports/:id/review", authenticate, adminController.handleReport);

// 📌 Delete a Reported Post (Admin Only)
router.delete("/posts/:postId", authenticate, adminController.deletePost);

// 📌 Warn a User (Admin Only)
router.post("/users/:userId/warn", authenticate, adminController.warnUser);

// 📌 Ban a User (Admin Only)
router.put('/ban/:userId', authenticate, adminController.banUser);

// 📌 Unban a User (Admin Only)
router.put('/unban/:userId', authenticate, adminController.unbanUser);

// 📌 Get Admin Dashboard Stats
router.get("/dashboard", authenticate, adminController.getDashboardStats);

// 📌 Get User Details (Admin Only)
router.get("/users/:userId", authenticate, adminController.getUser);

// Get all users
router.get("/users", authenticate, adminController.getAllUsers);

// Update user
router.put("/users/:userId", authenticate, adminController.updateUser);

// Delete user
router.delete("/users/:userId", authenticate, adminController.deleteUser);

module.exports = router;
