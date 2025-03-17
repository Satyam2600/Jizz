const Confession = require("../models/confession");

exports.createConfession = async (req, res) => {
  try {
    const confession = new Confession(req.body);
    await confession.save();
    res.status(201).json(confession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConfessions = async (req, res) => {
  try {
    const confessions = await Confession.find();
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
