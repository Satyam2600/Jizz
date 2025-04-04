const mongoose = require("mongoose");
const User = require("./models/User"); // Import the User model
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    updateUsers();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

async function updateUsers() {
  try {
    await User.updateMany(
      {},
      {
        $set: {
          avatar: "/assets/images/default-avatar.jpg",
          banner: "/assets/images/default-banner.jpg",
        },
      }
    );
    console.log("Users updated successfully!");
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    mongoose.connection.close(); // Close the database connection
  }
}