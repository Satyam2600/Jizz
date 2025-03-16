const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Send a Message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    if (!receiver || !content) return res.status(400).json({ message: "Receiver and content are required" });

    const message = new Message({
      sender: req.user.id,
      receiver,
      content,
    });

    await message.save();
    res.status(201).json({ message: "Message sent successfully", messageData: message });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Get Messages between Two Users
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
