const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "messages", // Cloudinary folder for messages
    allowedFormats: ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi", "pdf", "docx"],
    resource_type: "auto",
  },
});

const upload = multer({ storage });
module.exports = upload;
