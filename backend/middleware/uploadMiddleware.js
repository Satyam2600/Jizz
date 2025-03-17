const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "messages", // Cloudinary folder
    allowedFormats: ["jpg", "png", "jpeg", "mp4", "pdf", "docx"],
    resource_type: "auto",
  },
});

const upload = multer({ storage });

module.exports = upload;
