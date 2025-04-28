const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const { authenticate } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/communities');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Get communities (with sorting/filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    const { tab, search } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    let sort = {};
    if (tab === 'trending') sort = { members: -1 };
    else if (tab === 'newest') sort = { createdAt: -1 };
    
    const communities = await Community.find(query)
      .sort(sort)
      .populate('members', 'fullName rollNumber')
      .lean();

    // Add isMember flag for each community
    const communitiesWithMembership = communities.map(community => ({
      ...community,
      isMember: community.members.some(member => member._id.toString() === req.user._id.toString())
    }));

    res.json(communitiesWithMembership);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Create community with file upload
router.post('/', authenticate, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received community data:', req.body);
    console.log('Received files:', req.files);
    
    const { name, description, category, privacy } = req.body;
    
    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ 
        error: 'Name, description, and category are required',
        received: req.body
      });
    }

    // Process file paths
    let avatarPath = null;
    let coverImagePath = null;
    
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        avatarPath = '/uploads/communities/' + req.files.avatar[0].filename;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        coverImagePath = '/uploads/communities/' + req.files.coverImage[0].filename;
      }
    }

    // Create community with creator as first member
    const community = new Community({
      name,
      description,
      category,
      privacy: privacy || 'public',
      avatar: avatarPath,
      coverImage: coverImagePath,
      members: [req.user._id],
      createdBy: req.user._id
    });

    await community.save();
    
    res.status(201).json({
      success: true,
      community
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

// Join community
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is already a member
    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already a member of this community' });
    }

    // Add user to members
    community.members.push(req.user._id);
    await community.save();

    res.json({ 
      success: true,
      message: 'Successfully joined the community'
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// Leave community
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member
    const memberIndex = community.members.indexOf(req.user._id);
    if (memberIndex === -1) {
      return res.status(400).json({ error: 'You are not a member of this community' });
    }

    // Remove user from members
    community.members.splice(memberIndex, 1);
    await community.save();

    res.json({ 
      success: true,
      message: 'Successfully left the community'
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

module.exports = router;