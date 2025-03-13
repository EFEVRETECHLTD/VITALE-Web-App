const mongoose = require('mongoose');
const { mockUsers, mockProtocols, mockReviews, hashPasswords, getPreHashedUsers } = require('./mockData');
const { connectDB } = require('../config/db');
const { loadGeneratedProtocols } = require('./generateProtocols');

// In-memory database for fallback
let inMemoryDB = {
  users: [],
  protocols: [],
  reviews: []
};

// Seed database function
const seedDatabase = async () => {
  try {
    // Try to connect to MongoDB
    const isMongoConnected = await connectDB();
    
    if (isMongoConnected) {
      // If MongoDB is connected, seed the MongoDB database
      console.log('Seeding MongoDB database...');
      await seedMongoDB();
    } else {
      // If MongoDB is not connected, seed the in-memory database
      console.log('Seeding in-memory database...');
      await seedInMemoryDB();
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    throw error;
  }
};

// Seed MongoDB database
const seedMongoDB = async () => {
  try {
    // Import models
    const User = require('../models/User');
    const Protocol = require('../models/Protocol');
    const Review = require('../models/Review');
    
    // Clear existing data
    await User.deleteMany();
    await Protocol.deleteMany();
    await Review.deleteMany();
    
    console.log('Previous data cleared');
    
    // Hash passwords for mock users
    const hashedUsers = await getPreHashedUsers();
    
    // Insert users
    const createdUsers = await User.insertMany(
      hashedUsers.map(user => ({
        username: user.username,
        email: user.email,
        password: user.password,
        jobPosition: user.jobPosition,
        role: user.role,
        department: user.department,
        profileImage: user.profileImage
      }))
    );
    
    console.log(`${createdUsers.length} users created`);
    
    // Create a map of user IDs
    const userIdMap = {};
    createdUsers.forEach((user, index) => {
      userIdMap[mockUsers[index].id] = user._id;
    });
    
    // Insert protocols with mapped user IDs
    const createdProtocols = await Protocol.insertMany(
      mockProtocols.map(protocol => ({
        name: protocol.name,
        slug: protocol.id,
        description: protocol.description,
        category: protocol.category,
        author: userIdMap[protocol.author],
        dateCreated: new Date(protocol.dateCreated),
        datePublished: protocol.datePublished ? new Date(protocol.datePublished) : null,
        publishTime: protocol.publishTime,
        status: protocol.status,
        imageUrl: protocol.imageUrl,
        keyFeatures: protocol.keyFeatures,
        steps: protocol.steps,
        materials: protocol.materials,
        equipment: protocol.equipment,
        visibility: protocol.visibility
      }))
    );
    
    console.log(`${createdProtocols.length} protocols created`);
    
    // Create a map of protocol IDs
    const protocolIdMap = {};
    createdProtocols.forEach((protocol, index) => {
      protocolIdMap[mockProtocols[index].id] = protocol._id;
    });
    
    // Insert reviews with mapped user and protocol IDs
    const createdReviews = await Review.insertMany(
      mockReviews.map(review => ({
        protocol: protocolIdMap[review.protocol],
        user: userIdMap[review.user],
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        metrics: review.metrics,
        dateCreated: new Date(review.dateCreated),
        verified: review.verified
      }))
    );
    
    console.log(`${createdReviews.length} reviews created`);
    
  } catch (error) {
    console.error(`Error seeding MongoDB: ${error.message}`);
    throw error;
  }
};

// Seed in-memory database
const seedInMemoryDB = async () => {
  try {
    // Get pre-hashed users for the in-memory database
    const hashedUsers = await getPreHashedUsers();
    
    // Set in-memory database
    inMemoryDB.users = hashedUsers;
    inMemoryDB.protocols = mockProtocols;
    inMemoryDB.reviews = mockReviews;
    
    console.log(`${inMemoryDB.users.length} users created in memory`);
    console.log(`${inMemoryDB.protocols.length} protocols created in memory`);
    console.log(`${inMemoryDB.reviews.length} reviews created in memory`);
    
    // Load generated protocols if available
    const generatedProtocols = loadGeneratedProtocols();
    if (generatedProtocols && generatedProtocols.length > 0) {
      // Replace the protocols with the generated ones
      inMemoryDB.protocols = generatedProtocols;
      console.log(`Loaded ${generatedProtocols.length} generated protocols`);
    }
    
  } catch (error) {
    console.error(`Error seeding in-memory database: ${error.message}`);
    throw error;
  }
};

// Get in-memory database
const getInMemoryDB = () => {
  return inMemoryDB;
};

module.exports = {
  seedDatabase,
  getInMemoryDB
};
