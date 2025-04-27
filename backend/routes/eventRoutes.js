const express = require('express');
const router = express.Router();
const { getAllEvents, getYourEvents, getSavedEvents, createEvent, joinEvent, leaveEvent, saveEvent } = require('../controllers/eventController');
const { authenticate } = require('../middleware/authMiddleware');

// Get all events
router.get('/', authenticate, getAllEvents);

// Get events the user has joined
router.get('/your-events', authenticate, getYourEvents);

// Get saved events
router.get('/saved-events', authenticate, getSavedEvents);

// Create a new event
router.post('/', authenticate, createEvent);

// Join an event
router.post('/:id/join', authenticate, joinEvent);

// Leave an event
router.post('/:id/leave', authenticate, leaveEvent);

// Save an event
router.post('/:id/save', authenticate, saveEvent);

module.exports = router;