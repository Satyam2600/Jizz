const express = require("express");
const router = express.Router();
const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

// Initialize Brevo (SendinBlue) API Client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // Ensure this is set in .env

const emailAPI = new SibApiV3Sdk.TransactionalEmailsApi();

// Newsletter Subscription Route
router.post("/subscribe", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: process.env.EMAIL_NAME };
        sendSmtpEmail.subject = "Welcome to Our Newsletter!";
        sendSmtpEmail.htmlContent = `<p>Thank you for subscribing to our newsletter! 🎉</p>`;

        await emailAPI.sendTransacEmail(sendSmtpEmail);
        res.status(200).json({ success: true, message: "Subscription successful!" });

    } catch (error) {
        console.error("Brevo API Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

module.exports = router;
