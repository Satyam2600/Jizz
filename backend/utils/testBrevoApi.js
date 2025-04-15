// Test script for Brevo API
require('dotenv').config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

async function testBrevoApi() {
  try {
    console.log("Testing Brevo API connection...");
    
    // Check if API key is set
    if (!process.env.BREVO_API_KEY) {
      console.error("❌ BREVO_API_KEY is not set in environment variables");
      return;
    }
    
    console.log("API key is set:", process.env.BREVO_API_KEY.substring(0, 10) + "...");
    
    // Initialize the API client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    // Create an instance of the API
    const apiInstance = new SibApiV3Sdk.AccountApi();
    
    // Try to get account information
    console.log("Attempting to get account information...");
    const accountInfo = await apiInstance.getAccount();
    
    console.log("✅ Successfully connected to Brevo API");
    console.log("Account information:", accountInfo);
    
    return accountInfo;
  } catch (error) {
    console.error("❌ Error connecting to Brevo API:", error);
    console.error("Error details:", error.message);
    if (error.response) {
      console.error("API response:", error.response.body);
    }
    return null;
  }
}

// Run the test
testBrevoApi(); 