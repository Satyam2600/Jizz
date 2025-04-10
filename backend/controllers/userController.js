const User = require("../models/User");

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ rollNo: req.user.id }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// Update User Profile (Including UID)
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, profilePic, rollNo } = req.body;
    const user = await User.findOne({ rollNo: req.user.id });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure UID/Roll No. is unique if changed
    if (rollNo && rollNo !== user.rollNo) {
      const existingUser = await User.findOne({ rollNo });
      if (existingUser) return res.status(400).json({ message: "Roll No. already taken" });
    }

    // Update fields
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;
    user.rollNo = rollNo || user.rollNo;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, username, department, year, semester, bio, skills, interests, portfolio, linkedin, isPublic } = req.body;
        
        const user = await User.findOne({ rollNo: req.user.rollNo });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        user.department = department || user.department;
        user.year = year || user.year;
        user.semester = semester || user.semester;
        user.bio = bio || user.bio;
        user.skills = skills ? skills.split(',').map(skill => skill.trim()) : user.skills;
        user.interests = interests ? interests.split(',').map(interest => interest.trim()) : user.interests;
        user.portfolio = portfolio || user.portfolio;
        user.socialLinks = {
            ...user.socialLinks,
            linkedin: linkedin || user.socialLinks?.linkedin
        };
        user.isPublic = isPublic !== undefined ? isPublic : user.isPublic;

        await user.save();

        res.json({ 
            message: 'Profile updated successfully',
            user: {
                fullName: user.fullName,
                username: user.username,
                department: user.department,
                year: user.year,
                semester: user.semester,
                bio: user.bio,
                skills: user.skills,
                interests: user.interests,
                portfolio: user.portfolio,
                socialLinks: user.socialLinks,
                isPublic: user.isPublic
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
