const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔍 MONGO_URI:", process.env.MONGO_URI); // Debugging line

    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing! Check your .env file.");
    }

 

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
