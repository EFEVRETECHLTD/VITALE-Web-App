const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB is enabled
    if (process.env.USE_MONGODB !== 'true') {
      console.log('MongoDB is disabled by configuration');
      return false;
    }

    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instrument-status';
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: process.env.MONGODB_POOL_SIZE || 100,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);
    
    console.log('MongoDB connected successfully');
    global.isMongoConnected = true;
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      global.isMongoConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      global.isMongoConnected = false;
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      global.isMongoConnected = true;
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    global.isMongoConnected = false;
    return false;
  }
};

module.exports = { connectDB };
