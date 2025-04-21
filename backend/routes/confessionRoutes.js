const express = require("express");
const router = express.Router();
const confessionController = require("../controllers/confessionController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new confession
router.post("/", authMiddleware, confessionController.createConfession);

// Get all confessions
router.get("/", authMiddleware, confessionController.getConfessions);

// Like a confession
router.post("/:id/like", authMiddleware, confessionController.likeConfession);

// Add a comment to a confession
router.post("/:id/comments", authMiddleware, confessionController.addComment);

// Delete a confession
router.delete("/:id", authMiddleware, confessionController.deleteConfession);

module.exports = router;
