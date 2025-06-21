const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadCommunity, uploadToCloudinary } = require('../middleware/uploadMiddleware');

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

// Create a new community with Cloudinary upload
router.post('/', authenticate, uploadCommunity, uploadToCloudinary, async (req, res) => {
  try {
    const { name, description, category, isPrivate } = req.body;
    
    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCommunity) {
      return res.status(400).json({ success: false, message: 'Community name already exists' });
    }

    // Get image URL from Cloudinary upload
    let imageUrl = null;
    if (req.cloudinaryResult) {
      imageUrl = req.cloudinaryResult.url;
    }

    const community = new Community({
      name,
      description,
      category,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      image: imageUrl,
      members: [req.user._id] // Creator is automatically a member
    });

    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate('createdBy', 'fullName username avatar')
      .populate('members', 'fullName username avatar');

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community: populatedCommunity
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ success: false, message: 'Error creating community', error: error.message });
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