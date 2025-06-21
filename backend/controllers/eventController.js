const Event = require('../models/Event');
const { uploadEvent, uploadToCloudinary } = require('../middleware/uploadMiddleware');

// Fetch all events
const getAllEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Add search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    const events = await Event.find(query)
      .populate('participants', 'name avatar') // Populate name and avatar for participants
      .populate('createdBy', 'name avatar') // Populate name and avatar for creator
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
};

// Fetch events created by the user
const getYourEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
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

// Create a new event with Cloudinary upload
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category, maxParticipants } = req.body;
    
    // Get cover image URL from Cloudinary upload
    let coverImageUrl = null;
    if (req.cloudinaryResult) {
      coverImageUrl = req.cloudinaryResult.url;
    }

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      category,
      maxParticipants: maxParticipants || null,
      coverImage: coverImageUrl,
      createdBy: req.user._id,
      participants: [req.user._id] // Creator is automatically a participant
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name avatar')
      .populate('participants', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
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