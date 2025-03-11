const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Check if we're using MongoDB or in-memory mode
    if (process.env.USE_MONGODB === 'true' && process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        // Connection options
      });
      
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return true;
    } else {
      console.log('Using in-memory database mode');
      return false;
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Continue with in-memory mode if MongoDB connection fails
    console.log('Falling back to in-memory database mode');
    return false;
  }
};

module.exports = connectDB;
