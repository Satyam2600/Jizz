// Script to fix user data in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixUserData() {
  try {
    console.log('Fixing user data...');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Find users with missing rollNo
    console.log('Finding users with missing rollNo...');
    const users = await User.find({ rollNo: { $exists: false } });
    console.log(`Found ${users.length} users with missing rollNo`);
    
    if (users.length > 0) {
      console.log('Fixing users with missing rollNo...');
      
      for (const user of users) {
        // Generate a random rollNo based on email
        const emailPrefix = user.email.split('@')[0];
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newRollNo = `${emailPrefix}${randomSuffix}`;
        
        console.log(`Fixing user: ${user.email} -> RollNo: ${newRollNo}`);
        
        // Update the user's rollNo
        await User.updateOne(
          { _id: user._id },
          { $set: { rollNo: newRollNo } }
        );
      }
      
      console.log('All users fixed successfully');
    } else {
      console.log('No users with missing rollNo found');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error fixing user data:', error);
  }
}

fixUserData(); 