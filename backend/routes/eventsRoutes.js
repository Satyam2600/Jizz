const express = require("express");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create an Event
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    if (!title || !date) return res.status(400).json({ message: "Title and date are required" });
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      creator: req.user.id,
      attendees: [req.user.id],
    });
    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Join an Event
router.post("/:eventId/join", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      await event.save();
    }
    res.status(200).json({ message: "Joined event successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Leave an Event
router.post("/:eventId/leave", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.attendees = event.attendees.filter(att => att.toString() !== req.user.id);
    await event.save();
    res.status(200).json({ message: "Left event successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Get All Events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
