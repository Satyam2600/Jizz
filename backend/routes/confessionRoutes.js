const express = require("express");
const Confession = require("./models/Confession");

const router = express.Router();

// 📌 Post a Confession (Anonymous)
router.post("/", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const newConfession = new Confession({ content });
    await newConfession.save();

    res.status(201).json({ message: "Confession posted", confession: newConfession });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Get All Confessions
router.get("/", async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });
    res.status(200).json(confessions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
