const Message = require("../models/Message");
// Send a message (sender, receiver, content)
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const sender = req.user.id || req.user._id;
    if (!receiver || !content) return res.status(400).json({ message: 'Receiver and content required' });
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get messages between current user and another user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
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