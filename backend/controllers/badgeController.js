const Badge = require("../models/Badge");
const User = require("../models/User");

exports.createBadge = async (req, res) => {
  try {
    const badge = new Badge(req.body);
    await badge.save();
    res.status(201).json(badge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('badges');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.awardBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    const user = await User.findById(userId);
    const badge = await Badge.findById(badgeId);

    if (!user || !badge) {
      return res.status(404).json({ message: "User or badge not found" });
    }

    if (!user.badges.includes(badge._id)) {
      user.badges.push(badge._id);
      await user.save();
    }

    res.json({ message: "Badge awarded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeBadge = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.badges = user.badges.filter(badge => badge.toString() !== badgeId);
    await user.save();

    res.json({ message: "Badge removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
