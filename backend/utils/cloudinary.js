const { cloudinary, CLOUDINARY_CONFIG } = require('../config/cloudinary');
const fs = require('fs');

// Generic upload function for any content type
const uploadToCloudinary = async (fileData, contentType = 'posts') => {
  try {
    const options = CLOUDINARY_CONFIG.uploadOptions[contentType] || CLOUDINARY_CONFIG.uploadOptions.posts;
    
    // Handle both file paths and base64 data URIs
    let uploadData = fileData;
    let shouldDeleteFile = false;
    
    // If it's a file path (for migration script)
    if (typeof fileData === 'string' && !fileData.startsWith('data:')) {
      uploadData = fileData;
      shouldDeleteFile = true;
    }
    // If it's a base64 data URI (for regular uploads)
    else if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      uploadData = fileData;
      shouldDeleteFile = false;
    }
    
    const result = await cloudinary.uploader.upload(uploadData, {
      ...options,
      public_id: `${contentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Delete the temporary file only if it was a file path
    if (shouldDeleteFile && fs.existsSync(fileData)) {
      fs.unlinkSync(fileData);
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    // Delete the temporary file in case of error (only if it was a file path)
    if (typeof fileData === 'string' && !fileData.startsWith('data:') && fs.existsSync(fileData)) {
      fs.unlinkSync(fileData);
    }
    throw error;
  }
};

// Upload image to Cloudinary (legacy function for backward compatibility)
const uploadImageToCloudinary = async (filePath) => {
  return uploadToCloudinary(filePath, 'confessions');
};

// Upload profile picture
const uploadProfilePicture = async (filePath) => {
  return uploadToCloudinary(filePath, 'profiles');
};

// Upload post media
const uploadPostMedia = async (filePath) => {
  return uploadToCloudinary(filePath, 'posts');
};

// Upload community image
const uploadCommunityImage = async (filePath) => {
  return uploadToCloudinary(filePath, 'communities');
};

// Upload event image
const uploadEventImage = async (filePath) => {
  return uploadToCloudinary(filePath, 'events');
};

// Upload message media
const uploadMessageMedia = async (filePath) => {
  return uploadToCloudinary(filePath, 'messages');
};

// Upload avatar
const uploadAvatar = async (filePath) => {
  return uploadToCloudinary(filePath, 'avatars');
};

// Upload banner
const uploadBanner = async (filePath) => {
  return uploadToCloudinary(filePath, 'banners');
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Get optimized URL for different use cases
const getOptimizedUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto', crop = 'fill' } = options;
  const baseUrl = url.split('/upload/')[0] + '/upload/';
  const transformations = [];
  
  if (width && height) {
    transformations.push(`w_${width},h_${height},c_${crop}`);
  } else if (width) {
    transformations.push(`w_${width}`);
  } else if (height) {
    transformations.push(`h_${height}`);
  }
  
  if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  const imagePath = url.split('/upload/')[1];
  
  return `${baseUrl}${transformString}${imagePath}`;
};

module.exports = {
  uploadToCloudinary,
  uploadImageToCloudinary,
  uploadProfilePicture,
  uploadPostMedia,
  uploadCommunityImage,
  uploadEventImage,
  uploadMessageMedia,
  uploadAvatar,
  uploadBanner,
  deleteFromCloudinary,
  getOptimizedUrl,
  CLOUDINARY_CONFIG
}; 