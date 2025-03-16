const express = require("express");
const Group = require("../models/Group");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Create a Group
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    const group = new Group({
      name,
      description,
      admin: req.user.id,
      members: [req.user.id],
    });

    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Join a Group
router.post("/:groupId/join", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.status(200).json({ message: "Joined group successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Leave a Group
router.post("/:groupId/leave", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter((member) => member.toString() !== req.user.id);
    await group.save();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
