const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User"); // Import the User model

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../frontend/assets/uploads");
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Endpoint to upload profile photo and update user avatar
router.post("/profile-photo", upload.single("profilePhoto"), async (req, res) => {
    const { userId } = req.body;

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        // Update the user's avatar in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatar: `/assets/uploads/${req.file.filename}` },
            { new: true }
        );

        if (updatedUser) {
            res.status(200).send({ filePath: updatedUser.avatar });
        } else {
            res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error updating profile photo:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// Endpoint to upload banner photo and update user banner
router.post("/banner-photo", upload.single("bannerPhoto"), async (req, res) => {
    const { userId } = req.body;

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        // Update the user's banner in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { banner: `/assets/uploads/${req.file.filename}` },
            { new: true }
        );

        if (updatedUser) {
            res.status(200).send({ filePath: updatedUser.banner });
        } else {
            res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error updating banner photo:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});

module.exports = router;