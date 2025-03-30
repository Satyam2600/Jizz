const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists in your backend directory
  },
  filename: (req, file, cb) => {
    // Append timestamp to original filename
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter: allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Endpoint to upload Profile Picture
router.post('/profile-picture', upload.single('profilePicture'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return file path or URL (adjust as needed)
    res.status(200).json({ message: 'Profile picture uploaded successfully', filePath: req.file.path });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Endpoint to upload Cover Photo
router.post('/cover-photo', upload.single('coverPhoto'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'Cover photo uploaded successfully', filePath: req.file.path });
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

module.exports = router;
