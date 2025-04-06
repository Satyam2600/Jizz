// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    avatar: { type: String, default: '/assets/images/default-avatar.jpg' },
    banner: { type: String, default: '/assets/images/default-banner.jpg' },
    department: String,
    year: String,
    bio: String,
    phoneNumber: String,
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String,
        instagram: String
    },
    isPublic: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);