const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Load environment variables

// Configure Cloudinary for production
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Production configuration
const CLOUDINARY_CONFIG = {
  // Folder structure for different content types
  folders: {
    posts: 'jizz/posts',
    profiles: 'jizz/profiles',
    communities: 'jizz/communities',
    events: 'jizz/events',
    messages: 'jizz/messages',
    confessions: 'jizz/confessions',
    avatars: 'jizz/avatars',
    banners: 'jizz/banners'
  },
  
  // Upload options for different content types
  uploadOptions: {
    posts: {
      folder: 'jizz/posts',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    },
    profiles: {
      folder: 'jizz/profiles',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    },
    communities: {
      folder: 'jizz/communities',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    },
    events: {
      folder: 'jizz/events',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    },
    messages: {
      folder: 'jizz/messages',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'docx'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    },
    confessions: {
      folder: 'jizz/confessions',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    },
    avatars: {
      folder: 'jizz/avatars',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' }
      ]
    },
    banners: {
      folder: 'jizz/banners',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { width: 1200, height: 400, crop: 'fill' }
      ]
    }
  }
};

module.exports = { cloudinary, CLOUDINARY_CONFIG };
