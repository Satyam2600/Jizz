const express = require("express");
const router = express.Router();
const SibApiV3Sdk = require("sib-api-v3-sdk");
const dotenv = require("dotenv");
const Newsletter = require("../models/Newsletter"); // Import the model

dotenv.config();

// Configure Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_API_KEY;

router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Check if the email already exists
        const existingSubscriber = await Newsletter.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ error: "Email is already subscribed" });
        }

        // Save to the database
        const newSubscriber = new Newsletter({ email });
        await newSubscriber.save();

        // Send a welcome email
        const emailContent = {
            sender: { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME },
            to: [{ email }],
            subject: "Welcome to Our Newsletter!",
            htmlContent: "<h2>Thank you for subscribing!</h2><p>Stay tuned for updates.</p>",
        };

        await apiInstance.sendTransacEmail(emailContent);

        res.status(200).json({ success: true, message: "Subscription successful!" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;
