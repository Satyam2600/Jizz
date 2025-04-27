const express = require("express");
const router = express.Router();
const confessionController = require("../controllers/confessionController");
const { authenticate } = require("../middleware/authMiddleware");

// Create a new confession
router.post("/", authenticate, confessionController.createConfession);

// Get all confessions
router.get("/", authenticate, confessionController.getConfessions);

// Like a confession
router.post("/:id/like", authenticate, confessionController.likeConfession);

// Add a comment to a confession
router.post("/:id/comments", authenticate, confessionController.addComment);

// Delete a confession
router.delete("/:id", authenticate, confessionController.deleteConfession);

module.exports = router;
