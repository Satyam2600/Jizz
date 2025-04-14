require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function updateUsersWithEmail() {
  try {
    // Find all users without an email field
    const usersWithoutEmail = await User.find({ email: { $exists: false } });
    
    console.log(`Found ${usersWithoutEmail.length} users without email`);
    
    // Update each user with a default email based on their roll number
    for (const user of usersWithoutEmail) {
      if (user.rollNumber) {
        const defaultEmail = `${user.rollNumber.toLowerCase()}@example.com`;
        
        await User.updateOne(
          { _id: user._id },
          { $set: { email: defaultEmail } }
        );
        
        console.log(`Updated user ${user.fullName} (${user.rollNumber}) with email: ${defaultEmail}`);
      } else {
        console.log(`User ${user.fullName} has no roll number, skipping email update`);
      }
    }
    
    console.log('Email update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
}

updateUsersWithEmail(); 