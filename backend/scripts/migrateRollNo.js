const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Drop the old rollNo index
        await User.collection.dropIndex('rollNo_1');
        console.log('Dropped old rollNo index');

        // Update all documents to move rollNo to rollNumber
        const result = await User.updateMany(
            { rollNo: { $exists: true } },
            { $rename: { rollNo: 'rollNumber' } }
        );
        console.log(`Updated ${result.nModified} documents`);

        // Create new index on rollNumber
        await User.collection.createIndex({ rollNumber: 1 }, { unique: true });
        console.log('Created new rollNumber index');

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrate(); 