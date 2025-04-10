const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '/assets/images/default-avatar.jpg' },
    rollNo: { type: String, required: true, unique: true, trim: true },
    banner: { type: String, default: '/assets/images/default-banner.jpg' },
    department: {
        type: String,
        required: true,
        enum: ["CSE", "ECE", "Mechanical", "Architecture", "Production", "Civil", "Electrical"],
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8,
    },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [], versionKey: false },
    interests: { type: [String], default: [], versionKey: false },
    portfolio: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    socialLinks: {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
        instagram: { type: String, default: "" }
    },
    isPublic: { type: Boolean, default: true },
    isFirstLogin: {
        type: Boolean,
        default: true,
        versionKey: false
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);
