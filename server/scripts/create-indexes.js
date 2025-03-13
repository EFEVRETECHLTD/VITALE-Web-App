/**
 * Script to create MongoDB indexes for better performance
 * Run with: node scripts/create-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instrument-status';

async function createIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100
    });
    
    console.log('Connected to MongoDB. Creating indexes...');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Create indexes for protocols collection
    console.log('Creating indexes for protocols collection...');
    await db.collection('protocols').createIndex({ name: 1 });
    await db.collection('protocols').createIndex({ createdAt: -1 });
    await db.collection('protocols').createIndex({ updatedAt: -1 });
    await db.collection('protocols').createIndex({ status: 1 });
    await db.collection('protocols').createIndex({ 'author.id': 1 });
    await db.collection('protocols').createIndex({ tags: 1 });
    
    // Create indexes for reviews collection
    console.log('Creating indexes for reviews collection...');
    await db.collection('reviews').createIndex({ protocolId: 1 });
    await db.collection('reviews').createIndex({ 'reviewer.id': 1 });
    await db.collection('reviews').createIndex({ createdAt: -1 });
    
    // Create indexes for users collection
    console.log('Creating indexes for users collection...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Create indexes for instruments collection
    console.log('Creating indexes for instruments collection...');
    await db.collection('instruments').createIndex({ name: 1 });
    await db.collection('instruments').createIndex({ status: 1 });
    await db.collection('instruments').createIndex({ type: 1 });
    
    console.log('All indexes created successfully!');
    
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createIndexes(); 