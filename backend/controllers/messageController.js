const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate("sender", "username");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Message.updateMany(
      { receiver: req.user.id, sender: userId, read: false },
      { read: true }
    );
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }
    
    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 