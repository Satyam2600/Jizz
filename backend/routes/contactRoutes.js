// backend/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const contactController = require("../controllers/contactController");

// Send contact message
router.post("/", authenticate, contactController.sendContactMessage);

// Get all contact messages (admin only)
router.get("/", authenticate, contactController.getAllContactMessages);

// Get user's contact messages
router.get("/user", authenticate, contactController.getUserContactMessages);

// Update contact message status (admin only)
router.put("/:contactId", authenticate, contactController.updateContactStatus);

// Delete contact message
router.delete("/:contactId", authenticate, contactController.deleteContactMessage);

module.exports = router;
