const Event = require('../models/Event');
const User = require('../models/User');
const { uploadImage } = require('../utils/upload');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, date, time, duration, category, 
            maxParticipants, tags, requirements } = req.body;
    
    // Upload cover image
    const coverImage = await uploadImage(req.files.cover);
    
    // Create new event
    const event = new Event({
      title,
      description,
      location,
      date: new Date(date),
      time,
      duration,
      category,
      coverImage,
      maxParticipants,
      tags: tags.split(',').map(tag => tag.trim()),
      requirements,
      organizer: req.user._id
    });

    await event.save();
    
    // Populate organizer details
    await event.populate('organizer', 'name profilePicture');
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name profilePicture')
      .populate('participants.user', 'name profilePicture')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Join an event
exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is already a participant
    const isParticipant = event.participants.some(
      participant => participant.user.toString() === req.user._id.toString()
    );

    if (isParticipant) {
      return res.status(400).json({
        success: false,
        error: 'You have already joined this event'
      });
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: 'Event is full'
      });
    }

    // Add user to participants
    event.participants.push({ user: req.user._id });
    await event.save();

    // Populate the new participant
    await event.populate('participants.user', 'name profilePicture');

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Leave an event
exports.leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      participant => participant.user.toString() !== req.user._id.toString()
    );

    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's events
exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { organizer: req.user._id },
        { 'participants.user': req.user._id }
      ]
    })
    .populate('organizer', 'name profilePicture')
    .populate('participants.user', 'name profilePicture')
    .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};