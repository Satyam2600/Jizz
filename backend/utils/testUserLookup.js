// Test script for user lookup
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function testUserLookup() {
  try {
    console.log('Testing user lookup...');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Get all users
    console.log('Getting all users...');
    const users = await User.find({}, 'rollNo email fullName');
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      console.log('Sample users:');
      users.slice(0, 5).forEach(user => {
        console.log(`- Roll No: ${user.rollNo}, Email: ${user.email}, Name: ${user.fullName}`);
      });
      
      // Test lookup by roll number
      const testRollNo = users[0].rollNo;
      console.log(`\nTesting lookup by roll number: ${testRollNo}`);
      const user = await User.findOne({ rollNo: testRollNo });
      
      if (user) {
        console.log('✅ User found:');
        console.log(`- Roll No: ${user.rollNo}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Name: ${user.fullName}`);
      } else {
        console.log('❌ User not found');
      }
    } else {
      console.log('No users found in the database');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error testing user lookup:', error);
  }
}

testUserLookup(); 