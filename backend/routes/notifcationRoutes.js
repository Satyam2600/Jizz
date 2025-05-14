const express = require("express");
const Notification = require("../models/Notification"); // Fix case
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a Notification
router.post("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const { type, message } = req.body;
    const notification = new Notification({
      user: req.user.id,
      type,
      message,
    });
    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Get Notifications for a User
router.get("/", authMiddleware.authenticate, require('../controllers/notificationController').getNotifications);

// Mark Notification as Read
router.put("/:id/read", authMiddleware.authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware.authenticate, require('../controllers/notificationController').markAllAsRead);

// Clear All Notifications for a User
router.delete("/clear", authMiddleware.authenticate, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
