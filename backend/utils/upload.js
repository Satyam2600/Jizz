const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  console.log('File being processed:', file.originalname, 'MIME type:', file.mimetype);
  
  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  
  // Check MIME type - be more lenient with MIME types
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif',
    'image/jpg',
    'application/octet-stream' // Some systems send this for images
  ];
  
  if (!allowedExtensions.includes(fileExtension)) {
    console.log('File extension not allowed:', fileExtension);
    return cb(new Error(`File extension ${fileExtension} not allowed. Only jpg, jpeg, png, gif are allowed.`), false);
  }
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    console.log('MIME type not allowed:', file.mimetype);
    return cb(new Error(`File type ${file.mimetype} not allowed. Only images are allowed.`), false);
  }
  
  console.log('File accepted:', file.originalname);
  cb(null, true);
};

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

module.exports = upload; 