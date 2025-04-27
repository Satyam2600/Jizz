const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

// Get user profile
router.get("/:userId", authenticate, profileController.getProfile);

// Update user profile
router.put("/", authenticate, profileController.updateProfile);

// Upload profile picture
router.post("/picture", authenticate, profileController.uploadProfilePicture);

// Upload cover photo
router.post("/cover", authenticate, profileController.uploadCoverPhoto);

module.exports = router; 