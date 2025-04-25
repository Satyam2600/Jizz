const User = require("../models/User");

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ rollNumber: req.user.id }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, profilePic, rollNumber } = req.body;
        const user = await User.findOne({ rollNumber: req.user.id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if new rollNumber is already taken
        if (rollNumber && rollNumber !== user.rollNumber) {
            const existingUser = await User.findOne({ rollNumber });
            if (existingUser) {
                return res.status(400).json({ message: "Roll number already taken" });
            }
        }

        // Update user fields
        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.profilePic = profilePic || user.profilePic;
        user.rollNumber = rollNumber || user.rollNumber;

        await user.save();
        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, username, department, year, semester, bio, skills, interests, portfolio, linkedin, isPublic } = req.body;
        
        const user = await User.findOne({ rollNumber: req.user.rollNumber });
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
