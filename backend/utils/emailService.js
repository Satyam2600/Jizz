// backend/utils/emailService.js
const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Validate email parameter
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      console.error("❌ Invalid email address:", to);
      throw new Error("Invalid email address");
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    // Validate API key
    if (!process.env.BREVO_API_KEY) {
      console.error("❌ BREVO_API_KEY is not set in environment variables");
      throw new Error("Email service configuration error");
    }

    // Validate sender email
    if (!process.env.EMAIL_FROM) {
      console.error("❌ EMAIL_FROM is not set in environment variables");
      throw new Error("Email service configuration error");
    }

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_NAME || "JIZZ Support",
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    console.log(`Attempting to send email to: ${to}`);
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email via Brevo:", error);
    throw error;
  }
};

module.exports = sendEmail;
