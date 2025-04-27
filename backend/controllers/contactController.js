const Contact = require("../models/Contact");
const User = require("../models/User");

exports.sendContactMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    const contact = new Contact({
      user: userId,
      subject,
      message,
      status: "pending"
    });

    await contact.save();
    res.status(201).json({ message: "Contact message sent successfully", contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status, adminResponse } = req.body;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    contact.status = status;
    contact.adminResponse = adminResponse;
    contact.respondedAt = new Date();
    contact.respondedBy = req.user.id;

    await contact.save();
    res.json({ message: "Contact status updated successfully", contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    // Only allow users to delete their own messages or admins to delete any message
    if (contact.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Contact.findByIdAndDelete(contactId);
    res.json({ message: "Contact message deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 