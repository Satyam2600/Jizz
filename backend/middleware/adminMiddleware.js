const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findOne({ rollNo: req.user.id });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = adminMiddleware;
