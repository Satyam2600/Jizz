const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Update user profile
router.post("/update-profile", async (req, res) => {
  try {
    const { 
      userId, 
      fullName, 
      username, 
      department,
      year,
      semester,
      bio,
      skills,
      interests,
      portfolio,
      phoneNumber, 
      github, 
      linkedin, 
      twitter, 
      instagram, 
      avatar, 
      banner
    } = req.body;

    // Use session userId if available, otherwise use the one from the request
    const userIdentifier = req.session.userId || userId;
    
    if (!userIdentifier) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Find the user and update their profile
    const user = await User.findOneAndUpdate(
      { rollNo: userIdentifier },
      { 
        fullName, 
        username, 
        department,
        year,
        semester,
        bio,
        skills: skills ? skills.split(',').map(skill => skill.trim()) : undefined,
        interests: interests ? interests.split(',').map(interest => interest.trim()) : undefined,
        portfolio,
        phoneNumber, 
        socialLinks: {
          github,
          linkedin,
          twitter,
          instagram
        },
        avatar,
        banner
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to fetch user profile
router.get("/get-profile", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findOne({ rollNo: userId });

    if (user) {
      res.status(200).json({
        name: user.fullName,
        rollNo: user.rollNo,
        avatar: user.avatar,
        banner: user.banner, // Added banner field to the response
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;