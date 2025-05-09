const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const messageController = require("../controllers/messageController");

// Send a message
router.post("/", authenticate, messageController.sendMessage);

// Get unread message counts
router.get('/unread-counts', authenticate, messageController.getUnreadCounts);

// Get messages between two users
router.get("/:userId", authenticate, messageController.getMessages);

// Mark messages as read
router.put("/:userId/read", authenticate, messageController.markAsRead);

// Delete a message
router.delete("/:messageId", authenticate, messageController.deleteMessage);

module.exports = router;
