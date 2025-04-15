// Test script for email service
require('dotenv').config({ path: './.env' });
const sendEmail = require('./utils/emailService');

async function testEmailService() {
  try {
    console.log('Testing email service...');
    console.log('Using email from:', process.env.EMAIL_FROM);
    console.log('Using API key:', process.env.BREVO_API_KEY ? 'API key is set' : 'API key is missing');
    
    const testEmail = 'jizzsocials@gmail.com'; // Using the same email as EMAIL_FROM for testing
    
    const htmlContent = `
      <h2>Test Email</h2>
      <p>This is a test email to verify that the email service is working properly.</p>
      <p>If you receive this email, the email service is configured correctly.</p>
    `;
    
    console.log(`Attempting to send test email to: ${testEmail}`);
    const response = await sendEmail(testEmail, 'Test Email from JIZZ', htmlContent);
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error testing email service:', error);
  }
}

testEmailService(); 