const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Multer middleware for media uploads

const router = express.Router();

// 📌 Send a Message (Text or Media)
router.post("/", authMiddleware, upload.single("media"), async (req, res) => {
  try {
    const { receiver, content } = req.body;
    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      mediaUrl = req.file.path; // Store Cloudinary URL or local path
      mediaType = req.file.mimetype.startsWith("image")
        ? "image"
        : req.file.mimetype.startsWith("video")
        ? "video"
        : "document";
    }

    if (!receiver || (!content && !mediaUrl)) {
      return res.status(400).json({ message: "Message must contain text or media" });
    }

    const message = new Message({
      sender: req.user.id,
      receiver,
      content,
      media: mediaUrl,
      mediaType,
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
