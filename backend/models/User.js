const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true,  // This allows multiple documents to have no rollNumber
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,  // This allows multiple documents to have no username
        trim: true
    },
    avatar: {
        type: String,
        default: '/assets/images/default-avatar.png'
    },
    banner: {
        type: String,
        default: '/assets/images/default-banner.jpg'
    },
    bio: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    year: {
        type: String,
        trim: true
    },
    semester: {
        type: String,
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    interests: [{
        type: String,
        trim: true
    }],
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
        instagram: String
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
