const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com", 
            port: 587,
            secure: false, 
            auth: {
                user: process.env.BREVO_EMAIL,
                pass: process.env.BREVO_API_KEY,
            },
        });

        await transporter.sendMail({
            from: process.env.BREVO_EMAIL,
            to,
            subject,
            text,
        });

        console.log("✅ Email sent successfully via Brevo");
    } catch (error) {
        console.error("❌ Email send failed:", error);
    }
};

module.exports = sendEmail;
