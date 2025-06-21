const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadPost, uploadProfile, uploadToCloudinary, uploadMessage, uploadConfession } = require('../middleware/uploadMiddleware');

// Route for uploading post media (images or videos)
router.post('/post-media', auth, uploadPost, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      type: req.cloudinaryResult.resource_type,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

// Route for uploading profile pictures
router.post('/profile-picture', auth, uploadProfile, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

// Route for uploading avatar
router.post('/avatar', auth, uploadProfile, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading avatar' });
  }
});

// Route for uploading banner
router.post('/banner', auth, uploadProfile, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading banner' });
  }
});

// Route for uploading community images
router.post('/community', auth, uploadProfile, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading community image' });
  }
});

// Route for uploading event images
router.post('/event', auth, uploadProfile, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading event image' });
  }
});

// Route for uploading message media
router.post('/message', auth, uploadMessage, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      type: req.cloudinaryResult.resource_type,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading message media' });
  }
});

// Route for uploading confession images
router.post('/confession', auth, uploadConfession, uploadToCloudinary, (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.status(200).json({
      success: true,
      filePath: req.cloudinaryResult.url,
      publicId: req.cloudinaryResult.public_id,
      format: req.cloudinaryResult.format,
      size: req.cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading confession image' });
  }
});

module.exports = router;