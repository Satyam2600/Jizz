const express = require("express");
const Notification = require("../models/Notification");
// Change the middleware import to match what's available in your project
const auth = require("../middleware/auth");

const router = express.Router();

// Create a Notification
router.post("/", auth, async (req, res) => {
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
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get Notifications for a User
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Mark Notification as Read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Clear All Notifications for a User
router.delete("/clear", auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
