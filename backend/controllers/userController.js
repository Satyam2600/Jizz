const User = require("../models/User");

// Get user profile by token (for edit profile page)
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findOne({ rollNumber: req.user.rollNumber }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user profile by username (for public profile page)
exports.getProfileByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).render('404');
        }
        const Post = require('../models/Post');
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
        res.render('profile', {
            user: {
                ...user.toObject(),
                postsCount: posts.length,
                followersCount: user.followers ? user.followers.length : 0,
                followingCount: user.following ? user.following.length : 0,
                isCurrentUser: req.user && req.user._id.equals(user._id),
                isFollowing: user.followers && req.user ? user.followers.includes(req.user._id) : false
            },
            posts
        });
    } catch (error) {
        res.status(500).render('500');
    }
};

// Update user profile (final, unified version)
exports.updateProfile = async (req, res) => {
    try {
        // Accept both form-data and JSON
        const data = req.body;
        const user = await User.findOne({ rollNumber: req.user.rollNumber });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update all fields from editProfile
        user.fullName = data.fullName || user.fullName;
        user.username = data.username || user.username;
        user.email = data.email || user.email;
        user.rollNumber = data.rollNumber || user.rollNumber;
        user.department = data.department || user.department;
        user.year = data.year || user.year;
        user.semester = data.semester || user.semester;
        user.bio = data.bio || user.bio;
        user.skills = data.skills ? data.skills : user.skills;
        user.interests = data.interests ? data.interests : user.interests;
        user.portfolio = data.portfolio || user.portfolio;
        user.linkedin = data.linkedin || user.linkedin;
        user.phoneNumber = data.phoneNumber || user.phoneNumber;
        user.isPublic = typeof data.isPublic !== 'undefined' ? data.isPublic : user.isPublic;
        // Handle avatar and banner if files are uploaded
        if (req.files && req.files.avatar && req.files.avatar[0]) {
            user.avatar = req.files.avatar[0].path.replace('backend/', '');
        }
        if (req.files && req.files.banner && req.files.banner[0]) {
            user.banner = req.files.banner[0].path.replace('backend/', '');
        }
        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
