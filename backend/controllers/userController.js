const User = require("../models/User");

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// Update User Profile (Including UID)
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, profilePic, rollNo } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure UID/Roll No. is unique if changed
    if (rollNo && rollNo !== user.rollNo) {
      const existingUser = await User.findOne({ rollNo });
      if (existingUser) return res.status(400).json({ message: "Roll No. already taken" });
    }

    // Update fields
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;
    user.rollNo = rollNo || user.rollNo;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};
