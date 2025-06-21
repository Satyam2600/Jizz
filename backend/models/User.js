const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Find the username field in your schema and modify it
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        // Remove the 'required: true' or change it to a conditional validation
        // Instead of:
        // required: [true, 'Please provide a username'],
        // Use:
        required: false,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    avatar: {
        type: String,
        default: 'default.jpg'
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    interests: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    } ,
    rollNumber: {
        type: String,
        required: [true, 'Please provide a roll number'],
        unique: true,
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
    skills: {
        type: [String],
        default: []
    },
    portfolio: {
        type: String,
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    github: {
        type: String,
        trim: true
    },
    twitter: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    banner: {
        type: String,
        trim: true
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    affiliatedWithJizz: { type: Boolean, default: false }, // Special badge flag
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
