const User = require('../models/User');
const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findOne({ rollNumber: req.user.id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const admin = await Admin.findOne({ user: user._id });
        if (!admin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = adminMiddleware;
