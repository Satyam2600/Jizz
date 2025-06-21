const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary, CLOUDINARY_CONFIG } = require("../config/cloudinary");
const path = require('path');

// Use memory storage instead of temp files
const memoryStorage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const contentType = req.body.contentType || req.query.contentType || 'posts';
  const allowedFormats = CLOUDINARY_CONFIG.uploadOptions[contentType]?.allowed_formats || 
                        CLOUDINARY_CONFIG.uploadOptions.posts.allowed_formats;
  
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedFormats.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed formats: ${allowedFormats.join(', ')}`), false);
  }
};

// Create multer instance with memory storage
const upload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Middleware to handle Cloudinary upload from memory
const uploadToCloudinary = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  try {
    const { uploadToCloudinary } = require('../utils/cloudinary');
    
    // Handle single file upload
    if (req.file) {
      const contentType = req.body.contentType || req.query.contentType || 'posts';
      
      // Convert buffer to base64 for Cloudinary
      const base64Data = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;
      
      const result = await uploadToCloudinary(dataURI, contentType);
      
      // Add Cloudinary result to request object
      req.cloudinaryResult = result;
    }
    
    // Handle multiple files upload (for profile updates)
    if (req.files) {
      req.cloudinaryResults = {};
      
      for (const [fieldName, files] of Object.entries(req.files)) {
        if (files && files.length > 0) {
          const file = files[0]; // Take the first file if multiple
          const contentType = fieldName === 'avatar' ? 'avatars' : 
                             fieldName === 'banner' ? 'banners' : 'posts';
          
          // Convert buffer to base64 for Cloudinary
          const base64Data = file.buffer.toString('base64');
          const dataURI = `data:${file.mimetype};base64,${base64Data}`;
          
          const result = await uploadToCloudinary(dataURI, contentType);
          
          // Add Cloudinary result to request object
          req.cloudinaryResults[fieldName] = result;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error uploading file to cloud storage',
      error: error.message
    });
  }
};

// Specific upload middlewares for different content types
const uploadPost = upload.single('media');
const uploadProfile = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);
const uploadCommunity = upload.single('image');
const uploadEvent = upload.single('coverImage');
const uploadMessage = upload.single('media');
const uploadConfession = upload.single('media');

module.exports = {
  upload,
  uploadToCloudinary,
  uploadPost,
  uploadProfile,
  uploadCommunity,
  uploadEvent,
  uploadMessage,
  uploadConfession,
  fileFilter
};
