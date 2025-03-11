const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Check if we're using MongoDB or in-memory mode
    if (process.env.USE_MONGODB === 'true' && process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 100, // Connection pooling for handling multiple concurrent requests
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      });
      
      // Set up connection error handlers for production resilience
      mongoose.connection.on('error', err => {
        console.error(`MongoDB connection error: ${err}`);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting to reconnect...');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.info('MongoDB reconnected successfully');
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
