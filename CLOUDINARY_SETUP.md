# Cloudinary Production Setup Guide

## Overview
This guide will help you migrate your Jizz platform from local file storage to Cloudinary (which uses AWS S3 as underlying storage) for production deployment.

## Prerequisites
1. Cloudinary account (free tier available)
2. Node.js and npm installed
3. MongoDB database
4. Environment variables configured

## Step 1: Cloudinary Account Setup

### 1.1 Create Cloudinary Account
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 1.2 Get Cloudinary Credentials
1. Log into your Cloudinary dashboard
2. Go to "Dashboard" → "Account Details"
3. Copy the following credentials:
   - Cloud Name
   - API Key
   - API Secret

### 1.3 Configure Cloudinary Settings
1. In your Cloudinary dashboard, go to "Settings" → "Upload"
2. Configure upload presets:
   - Set upload folder to "jizz"
   - Enable "Auto-upload folder"
   - Set resource type to "Auto"

## Step 2: Environment Configuration

### 2.1 Create .env file
Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jizz_platform

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration (Production S3 Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Brevo/Sendinblue)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@yourdomain.com

# Server Configuration
PORT=5000
NODE_ENV=production
```

### 2.2 Install Dependencies
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

## Step 3: Code Migration

### 3.1 Updated Files
The following files have been updated to use Cloudinary:

1. **`backend/config/cloudinary.js`** - Cloudinary configuration
2. **`backend/utils/cloudinary.js`** - Upload utilities
3. **`backend/middleware/uploadMiddleware.js`** - Upload middleware
4. **`backend/routes/uploadRoutes.js`** - Upload routes
5. **`backend/routes/postRoutes.js`** - Post routes
6. **`backend/routes/communityRoutes.js`** - Community routes
7. **`backend/routes/userRoutes.js`** - User routes
8. **`backend/routes/confessionRoutes.js`** - Confession routes
9. **`backend/controllers/postController.js`** - Post controller
10. **`backend/controllers/eventController.js`** - Event controller
11. **`backend/controllers/confessionController.js`** - Confession controller

### 3.2 New Upload Endpoints
The following new upload endpoints are available:

- `POST /api/uploads/post-media` - Upload post media
- `POST /api/uploads/profile-picture` - Upload profile picture
- `POST /api/uploads/avatar` - Upload avatar
- `POST /api/uploads/banner` - Upload banner
- `POST /api/uploads/community` - Upload community image
- `POST /api/uploads/event` - Upload event image
- `POST /api/uploads/message` - Upload message media
- `POST /api/uploads/confession` - Upload confession image

## Step 4: Frontend Updates

### 4.1 Update Upload URLs
Update your frontend JavaScript files to use the new upload endpoints:

```javascript
// Example: Upload post media
const formData = new FormData();
formData.append('media', file);

const response = await fetch('/api/uploads/post-media', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
// data.filePath now contains the Cloudinary URL
```

### 4.2 Handle Cloudinary URLs
Cloudinary URLs will be in the format:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/jizz/posts/filename.jpg
```

## Step 5: Testing

### 5.1 Test Uploads
1. Start your backend server
2. Test file uploads for each content type:
   - Posts (images/videos)
   - Profile pictures
   - Community images
   - Event images
   - Confessions

### 5.2 Verify Cloudinary Storage
1. Check your Cloudinary dashboard
2. Verify files are uploaded to the correct folders:
   - `jizz/posts/`
   - `jizz/profiles/`
   - `jizz/communities/`
   - `jizz/events/`
   - `jizz/messages/`
   - `jizz/confessions/`
   - `jizz/avatars/`
   - `jizz/banners/`

## Step 6: Production Deployment

### 6.1 Environment Variables
Ensure all environment variables are set in your production environment:

```bash
# Production environment variables
export CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
export CLOUDINARY_API_KEY=your_cloudinary_api_key
export CLOUDINARY_API_SECRET=your_cloudinary_api_secret
export NODE_ENV=production
```

### 6.2 Clean Up Local Files
Remove local upload directories:
```bash
rm -rf backend/uploads/
rm -rf frontend/assets/uploads/
```

### 6.3 Update .gitignore
Add the following to your `.gitignore`:
```
# Cloudinary temp files
backend/temp/
backend/uploads/
frontend/assets/uploads/
```

## Step 7: Monitoring and Optimization

### 7.1 Cloudinary Analytics
Monitor your Cloudinary usage:
1. Check bandwidth usage
2. Monitor storage usage
3. Review transformation usage

### 7.2 Performance Optimization
1. Use Cloudinary transformations for responsive images
2. Implement lazy loading for images
3. Use appropriate quality settings

### 7.3 Cost Optimization
1. Monitor your Cloudinary plan usage
2. Use appropriate image formats (WebP, AVIF)
3. Implement image compression

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check Cloudinary credentials
   - Verify file size limits
   - Check file type restrictions

2. **Images Not Loading**
   - Verify Cloudinary URLs are correct
   - Check CORS settings
   - Ensure proper authentication

3. **Performance Issues**
   - Use Cloudinary transformations
   - Implement caching
   - Optimize image sizes

### Support
- Cloudinary Documentation: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com

## Migration Checklist

- [ ] Create Cloudinary account
- [ ] Configure environment variables
- [ ] Install dependencies
- [ ] Update backend code
- [ ] Update frontend code
- [ ] Test all upload functionality
- [ ] Verify Cloudinary storage
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Clean up local files

## Benefits of Cloudinary Migration

1. **Scalability**: Automatic scaling with traffic
2. **Performance**: Global CDN delivery
3. **Reliability**: 99.9% uptime SLA
4. **Security**: Secure file storage
5. **Cost-effective**: Pay-as-you-go pricing
6. **Features**: Automatic image optimization
7. **Integration**: Easy AWS S3 integration 