const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, unique: true, sparse: true }, // ✅ Optional + unique only when present
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '/assets/images/default-avatar.jpg' },
    rollNo: { type: String, required: true, unique: true },
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
