const express = require('express');
const emojiData = require('@emoji-mart/data');
const { authenticate } = require("../middleware/authMiddleware");
const emojiController = require("../controllers/emojiController");

const router = express.Router();

// Route to serve emoji data
router.get('/emoji-data', (req, res) => {
    res.json(emojiData);
});

// Add emoji reaction
router.post("/:postId", authenticate, emojiController.addReaction);

// Remove emoji reaction
router.delete("/:postId", authenticate, emojiController.removeReaction);

module.exports = router;