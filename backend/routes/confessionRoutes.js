const express = require("express");
const router = express.Router();
const confessionController = require("../controllers/confessionController");
const { authenticate } = require("../middleware/authMiddleware");
const { uploadConfession, uploadToCloudinary } = require("../middleware/uploadMiddleware");

// Create a new confession with Cloudinary upload
router.post("/", authenticate, uploadConfession, uploadToCloudinary, confessionController.createConfession);

// Get all confessions
router.get("/", authenticate, confessionController.getConfessions);

// Like a confession
router.post("/:id/like", authenticate, confessionController.likeConfession);

// Add a comment to a confession
router.post("/:id/comments", authenticate, confessionController.addComment);

// Delete a confession (only by the user who created it)
router.delete("/:id", authenticate, confessionController.deleteConfession);

module.exports = router;
