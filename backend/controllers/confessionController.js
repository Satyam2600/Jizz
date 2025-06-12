const Confession = require("../models/Confession");
const User = require("../models/User");

// Create a new confession
exports.createConfession = async (req, res) => {
  try {
    const { content } = req.body;

    const confession = new Confession({
      user: req.user._id,
      content
    });

    await confession.save();
    
    // Remove user information before sending response
    const confessionObj = confession.toObject();
    delete confessionObj.user;
    
    res.status(201).json(confessionObj);
  } catch (error) {
    res.status(500).json({ message: "Error creating confession", error: error.message });
  }
};

// Get all confessions
exports.getConfessions = async (req, res) => {
  try {
    const confessions = await Confession.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "comments.user",
        select: "name avatar"
      });

    // Remove user information from confessions to maintain anonymity
    const anonymousConfessions = confessions.map(confession => {
      const confessionObj = confession.toObject();
      delete confessionObj.user;
      return confessionObj;
    });

    res.json(anonymousConfessions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching confessions", error: error.message });
  }
};

// Like a confession
exports.likeConfession = async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    const userIndex = confession.likedBy.indexOf(req.user._id);
    if (userIndex === -1) {
      confession.likedBy.push(req.user._id);
      confession.likes += 1;
    } else {
      confession.likedBy.splice(userIndex, 1);
      confession.likes -= 1;
    }

    await confession.save();
    
    // Remove user information before sending response
    const confessionObj = confession.toObject();
    delete confessionObj.user;
    
    res.json(confessionObj);
  } catch (error) {
    res.status(500).json({ message: "Error updating like", error: error.message });
  }
};

// Add a comment to a confession
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const confession = await Confession.findById(req.params.id);
    
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    const comment = {
      user: req.user._id,
      content: content.trim(),
      createdAt: new Date()
    };

    confession.comments.push(comment);
    await confession.save();

    // Remove user information from the confession to maintain anonymity
    const confessionObj = confession.toObject();
    delete confessionObj.user;
    
    res.status(201).json(confessionObj);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

// Delete a confession (only by the user who created it)
exports.deleteConfession = async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    if (confession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this confession" });
    }

    await confession.remove();
    res.json({ message: "Confession deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting confession", error: error.message });
  }
}; 