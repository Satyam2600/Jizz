const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../frontend/assets/uploads");
        cb(null, uploadPath); // Ensure this path exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Endpoint to upload profile photo
router.post("/profile-photo", upload.single("profilePhoto"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    res.status(200).send({ filePath: `/assets/uploads/${req.file.filename}` });
});

// Endpoint to upload cover photo
router.post("/cover-photo", upload.single("coverPhoto"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    res.status(200).send({ filePath: `/assets/uploads/${req.file.filename}` });
});

module.exports = router;