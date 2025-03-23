// backend/utils/emailService.js
const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Get default client instance
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    // Configure API key authorization: api-key
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Set sender details (must be a verified sender in your Brevo account)
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_FROM,   // Your sender email
      name: process.env.EMAIL_NAME,      // Your sender name
    };

    // Set recipient and email content
    sendSmtpEmail.to = [{ email: to }]; // Use 'to' parameter here
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    // Send transactional email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email via Brevo:", error);
    throw error;
  }
};

module.exports = sendEmail;
