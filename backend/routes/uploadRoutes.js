const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, "../../frontend/assets/uploads");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for both images and videos
const fileFilter = (req, file, cb) => {
    // Allowed MIME types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and videos (MP4, WEBM, MOV) are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit for videos
    }
});

// Update Profile Route: Use rollNo (uid) sent in req.body.userId
router.post(
  "/profile",
  authenticate,
  upload.fields([{ name: "avatar" }, { name: "banner" }]),
  async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { rollNo: req.body.userId },
        {
          fullName: req.body.fullName,
          username: req.body.username,
          department: req.body.department,
          bio: req.body.bio,
          phoneNumber: req.body.phoneNumber,
          socialLinks: {
            github: req.body.github,
            linkedin: req.body.linkedin,
            twitter: req.body.twitter,
            instagram: req.body.instagram,
          },
          ...(req.files.avatar && { avatar: `/assets/uploads/${req.files.avatar[0].filename}` }),
          ...(req.files.banner && { banner: `/assets/uploads/${req.files.banner[0].filename}` }),
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).send("User not found");
      }

      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Error updating profile");
    }
  }
);

// Profile photo upload endpoint
router.post("/profile-photo", authenticate, async (req, res) => {
    try {
        upload.single("profilePhoto")(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ message: "File is too large. Maximum size is 5MB." });
                    }
                    return res.status(400).json({ message: err.message });
                }
                return res.status(400).json({ message: "Error uploading file: " + err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            try {
                const user = await User.findByIdAndUpdate(
                    req.user.id,
                    { avatar: `/uploads/${req.file.filename}` },
                    { new: true }
                );

                if (!user) {
                    // Delete the uploaded file if user not found
                    fs.unlinkSync(req.file.path);
                    return res.status(404).json({ message: "User not found" });
                }

                res.json({ 
                    message: "Profile photo uploaded successfully",
                    filePath: `/uploads/${req.file.filename}` 
                });
            } catch (error) {
                // Delete the uploaded file if database update fails
                fs.unlinkSync(req.file.path);
                throw error;
            }
        });
    } catch (error) {
        console.error("Error in profile photo upload:", error);
        res.status(500).json({ message: "Server error while uploading profile photo" });
    }
});

// Cover photo upload endpoint
router.post("/cover-photo", authenticate, async (req, res) => {
    try {
        upload.single("coverPhoto")(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ message: "File is too large. Maximum size is 5MB." });
                    }
                    return res.status(400).json({ message: err.message });
                }
                return res.status(400).json({ message: "Error uploading file: " + err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            try {
                const user = await User.findByIdAndUpdate(
                    req.user.id,
                    { banner: `/uploads/${req.file.filename}` },
                    { new: true }
                );

                if (!user) {
                    // Delete the uploaded file if user not found
                    fs.unlinkSync(req.file.path);
                    return res.status(404).json({ message: "User not found" });
                }

                res.json({ 
                    message: "Cover photo uploaded successfully",
                    filePath: `/uploads/${req.file.filename}` 
                });
            } catch (error) {
                // Delete the uploaded file if database update fails
                fs.unlinkSync(req.file.path);
                throw error;
            }
        });
    } catch (error) {
        console.error("Error in cover photo upload:", error);
        res.status(500).json({ message: "Server error while uploading cover photo" });
    }
});

// Post media upload endpoint (handles both images and videos)
router.post("/post-media", authenticate, upload.single("media"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Set proper content type based on file type
        const isVideo = req.file.mimetype.startsWith('video/');
        const contentType = isVideo ? 'video' : 'image';

        // Ensure the file path starts with /assets/uploads/
        const filePath = `/assets/uploads/${req.file.filename}`;

        console.log('File uploaded:', {
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            filePath: filePath,
            contentType: contentType
        });

        res.json({
            message: "File uploaded successfully",
            filePath: filePath,
            contentType: contentType
        });
    } catch (error) {
        console.error("Error in post media upload:", error);
        res.status(500).json({ message: "Server error while uploading media" });
    }
});

module.exports = router;