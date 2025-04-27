const express = require("express");
const Group = require("../models/Group");
const { authenticate } = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

const router = express.Router();

// Create a Group
router.post("/", authenticate, groupController.createGroup);

// Get all groups
router.get("/", authenticate, groupController.getGroups);

// Get group by ID
router.get("/:groupId", authenticate, groupController.getGroup);

// Update group
router.put("/:groupId", authenticate, groupController.updateGroup);

// Delete group
router.delete("/:groupId", authenticate, groupController.deleteGroup);

// Add member to group
router.post("/:groupId/members", authenticate, groupController.addMember);

// Remove member from group
router.delete("/:groupId/members/:userId", authenticate, groupController.removeMember);

// Join a Group
router.post("/:groupId/join", authenticate, async (req, res) => {
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

// Leave a Group
router.post("/:groupId/leave", authenticate, async (req, res) => {
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
