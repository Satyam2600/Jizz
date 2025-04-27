const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../frontend/assets/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).single('coverImage');

// Fetch all events
const getAllEvents = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    // Add search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('participants', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
};

// Fetch events created by the user
const getYourEvents = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {
      $or: [
        { createdBy: req.user._id },
        { participants: req.user._id }
      ]
    };

    // Add search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('participants', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your events', error: error.message });
  }
};

// Fetch saved events
const getSavedEvents = async (req, res) => {
  try {
    const events = await Event.find({ savedBy: req.user._id }).populate('participants', 'name').populate('createdBy', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch saved events', error: error.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const {
                title,
                location,
                date,
                time,
                duration,
                category,
                description,
                maxParticipants,
                tags,
                requirements
            } = req.body;

            // Validate required fields
            if (!title || !location || !date || !time || !duration || !category || !description || !maxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: 'All required fields must be provided'
                });
            }

            // Create event object
            const eventData = {
                title,
                location,
                date: new Date(date),
                time,
                duration: parseInt(duration),
                category,
                description,
                maxParticipants: parseInt(maxParticipants),
                createdBy: req.user._id,
                participants: [req.user._id] // Add creator as first participant
            };

            // Add optional fields if provided
            if (tags) eventData.tags = tags.split(',').map(tag => tag.trim());
            if (requirements) eventData.requirements = requirements;
            if (req.file) eventData.coverImage = `/assets/uploads/${req.file.filename}`;

            const event = new Event(eventData);
            await event.save();

            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: event
            });
        } catch (error) {
            // If there's an error and a file was uploaded, delete it
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                success: false,
                message: 'Failed to create event',
                error: error.message
            });
        }
    });
};

// Join an event
const joinEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        // Check if user is already a participant
        if (event.participants.includes(req.user._id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already joined this event' 
            });
        }

        // Check if event has reached maximum participants
        if (event.participants.length >= event.maxParticipants) {
            return res.status(400).json({ 
                success: false, 
                message: 'Sorry, this event has reached its maximum number of participants' 
            });
        }

        // Add user to participants
        event.participants.push(req.user._id);
        await event.save();

        // Return updated event with populated participants
        const updatedEvent = await Event.findById(event._id)
            .populate('participants', 'name username avatar')
            .populate('createdBy', 'name username avatar');

        res.status(200).json({ 
            success: true, 
            message: 'Successfully joined the event',
            data: updatedEvent
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join event', 
            error: error.message 
        });
    }
};

// Leave an event
const leaveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        // Check if user is a participant
        if (!event.participants.includes(req.user._id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are not a participant of this event' 
            });
        }

        // Check if user is the creator
        if (event.createdBy.toString() === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Event creator cannot leave the event' 
            });
        }

        // Remove user from participants
        event.participants = event.participants.filter(
            participant => participant.toString() !== req.user._id.toString()
        );
        await event.save();

        // Return updated event with populated participants
        const updatedEvent = await Event.findById(event._id)
            .populate('participants', 'name username avatar')
            .populate('createdBy', 'name username avatar');

        res.status(200).json({ 
            success: true, 
            message: 'Successfully left the event',
            data: updatedEvent
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave event', 
            error: error.message 
        });
    }
};

// Save an event
const saveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user has already saved the event
    const isSaved = event.savedBy.includes(req.user._id);
    
    if (isSaved) {
      // Remove from saved events
      event.savedBy = event.savedBy.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add to saved events
      event.savedBy.push(req.user._id);
    }

    await event.save();

    res.status(200).json({ 
      success: true, 
      message: isSaved ? 'Event removed from saved events' : 'Event saved successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save event', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllEvents,
  getYourEvents,
  getSavedEvents,
  createEvent,
  joinEvent,
  leaveEvent,
  saveEvent
};