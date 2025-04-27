const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories if they don't exist
const baseUploadsDir = path.join(__dirname, '../../frontend/assets/uploads');
const eventsUploadsDir = path.join(baseUploadsDir, 'events');

[baseUploadsDir, eventsUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log('Creating directory:', dir);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination based on the field name
    const dest = file.fieldname === 'coverImage' ? eventsUploadsDir : baseUploadsDir;
    console.log('Saving file to directory:', dest);
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
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