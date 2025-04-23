const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createEvent,
  getEvents,
  joinEvent,
  leaveEvent,
  getUserEvents
} = require('../controllers/eventController');

// All routes are protected (require authentication)
router.use(authMiddleware);

// Event routes
router.post('/', createEvent);
router.get('/', getEvents);
router.get('/my-events', getUserEvents);
router.post('/:id/join', joinEvent);
router.post('/:id/leave', leaveEvent);

module.exports = router; 