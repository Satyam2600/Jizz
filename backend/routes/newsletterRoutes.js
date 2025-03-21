const express = require("express");
const router = express.Router();
const SibApiV3Sdk = require("sib-api-v3-sdk");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Configure Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Newsletter Subscription Route
router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const sender = {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME,
    };

    const receivers = [{ email }];

    const emailContent = {
        sender,
        to: receivers,
        subject: "Welcome to Our Newsletter!",
        htmlContent: "<h2>Thank you for subscribing!</h2><p>Stay tuned for updates.</p>",
    };

    try {
        await apiInstance.sendTransacEmail(emailContent);
        res.status(200).json({ success: true, message: "Subscription successful!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

module.exports = router;
