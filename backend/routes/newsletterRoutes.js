const express = require("express");
const router = express.Router();
const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();
const Newsletter = require("../models/Newsletter"); // Import the Newsletter model

// Initialize Brevo (SendinBlue) API Client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
const emailAPI = new SibApiV3Sdk.TransactionalEmailsApi();

// Newsletter Subscription Route
router.post("/subscribe", async (req, res) => {
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

        // Prepare and send the welcome email
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: process.env.EMAIL_NAME };
        sendSmtpEmail.subject = "Welcome to Our Newsletter!";
        sendSmtpEmail.htmlContent = `<h2>Thank you for subscribing!</h2><p>Stay tuned for updates.</p>`;

        await emailAPI.sendTransacEmail(sendSmtpEmail);

        res.status(200).json({ success: true, message: "Subscription successful!" });
    } catch (error) {
        console.error("Error in newsletter subscription:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;
