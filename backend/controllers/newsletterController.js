const Newsletter = require("../models/Newsletter");

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ error: "Email is already subscribed" });
    }

    // Save the subscription in the database
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res.status(200).json({ 
      success: true, 
      message: "Subscription successful!" 
    });
  } catch (error) {
    console.error("Error in newsletter subscription:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: "Email not found in subscribers list" });
    }

    await Newsletter.deleteOne({ email });
    res.status(200).json({ 
      success: true, 
      message: "Successfully unsubscribed" 
    });
  } catch (error) {
    console.error("Error in newsletter unsubscription:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: "Email not found in subscribers list" });
    }

    res.status(200).json({
      email: subscriber.email,
      preferences: subscriber.preferences,
      subscribedAt: subscriber.createdAt
    });
  } catch (error) {
    console.error("Error fetching newsletter preferences:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;
    if (!email || !preferences) {
      return res.status(400).json({ error: "Email and preferences are required" });
    }

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: "Email not found in subscribers list" });
    }

    subscriber.preferences = preferences;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: subscriber.preferences
    });
  } catch (error) {
    console.error("Error updating newsletter preferences:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}; 