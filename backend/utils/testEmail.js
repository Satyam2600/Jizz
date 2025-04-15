// Test script for email service
require('dotenv').config();
const sendEmail = require('./emailService');

async function testEmailService() {
  try {
    console.log('Testing email service...');
    
    // Use the same email as EMAIL_FROM for testing
    const testEmail = process.env.EMAIL_FROM;
    
    if (!testEmail) {
      console.error('❌ EMAIL_FROM is not set in environment variables');
      return;
    }
    
    console.log(`Using test email: ${testEmail}`);
    
    const htmlContent = `
      <h2>Test Email</h2>
      <p>This is a test email to verify that the email service is working properly.</p>
      <p>If you receive this email, the email service is configured correctly.</p>
    `;
    
    console.log(`Attempting to send test email to: ${testEmail}`);
    const response = await sendEmail(testEmail, 'Test Email from JIZZ', htmlContent);
    console.log('✅ Email sent successfully:', response);
  } catch (error) {
    console.error('❌ Error testing email service:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('API response:', error.response.body);
    }
  }
}

testEmailService(); 