const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User"); // Ensure User model is imported

const router = express.Router();

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

// Update Profile Route: Use rollNo (uid) sent in req.body.userId
router.post(
  "/profile",
  upload.fields([{ name: "avatar" }, { name: "banner" }]),
  async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { rollNo: req.body.userId }, // Use the uid (roll number) as the identifier
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

      res.redirect("/dashboard"); // Redirect to the dashboard after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Error updating profile");
    }
  }
);
// Endpoint for updating Profile Photo
router.post("/profile-photo", upload.single("profilePhoto"), async (req, res) => {
  try {
    // Use session userId if available, otherwise use the one from the request
    const userIdentifier = req.session.userId || req.body.userId;
    
    if (!userIdentifier) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findOneAndUpdate(
      { rollNo: userIdentifier }, // Using the uid (rollNo) sent in the request body
      { avatar: `/assets/uploads/${req.file.filename}` },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ filePath: `/assets/uploads/${req.file.filename}` });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).json({ message: "Error updating profile photo" });
  }
});

// Endpoint for updating Cover Photo
router.post("/cover-photo", upload.single("coverPhoto"), async (req, res) => {
  try {
    // Use session userId if available, otherwise use the one from the request
    const userIdentifier = req.session.userId || req.body.userId;
    
    if (!userIdentifier) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findOneAndUpdate(
      { rollNo: userIdentifier }, // Using the uid (rollNo) sent in the request body
      { banner: `/assets/uploads/${req.file.filename}` },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ filePath: `/assets/uploads/${req.file.filename}` });
  } catch (error) {
    console.error("Error updating cover photo:", error);
    res.status(500).json({ message: "Error updating cover photo" });
  }
});
module.exports = router;