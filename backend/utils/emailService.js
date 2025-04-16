const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log("Email service configuration:");
    console.log("- EMAIL_FROM:", process.env.EMAIL_FROM);
    console.log("- EMAIL_NAME:", process.env.EMAIL_NAME || "JIZZ Support");
    console.log("- BREVO_API_KEY:", process.env.BREVO_API_KEY ? "API key is set" : "API key is missing");

    // Validate email parameter
    if (!to || typeof to !== "string" || !to.includes("@")) {
      console.error("❌ Invalid email address:", to);
      throw new Error("Invalid email address");
    }

    // Validate API key
    if (!process.env.BREVO_API_KEY) {
      console.error("❌ BREVO_API_KEY is not set in environment variables");
      throw new Error("Email service configuration error: Missing API key");
    }

    // Validate sender email
    if (!process.env.EMAIL_FROM) {
      console.error("❌ EMAIL_FROM is not set in environment variables");
      throw new Error("Email service configuration error: Missing sender email");
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

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
    console.log(`Email subject: ${subject}`);
    console.log(`Email content length: ${htmlContent.length} characters`);

    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email via Brevo:", error);
    console.error("Error details:", error.message);

    // Log API response if available
    if (error.response) {
      console.error("API response:", error.response.body);
    }

    // Throw a user-friendly error
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;