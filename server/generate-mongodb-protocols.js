// Script to generate protocols and store them in MongoDB
require('dotenv').config();

// Set environment variables for MongoDB
process.env.ALLOW_IN_MEMORY = 'true';
process.env.USE_MONGODB = 'true';

// Import required modules
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const { generateProtocol } = require('./utils/generateProtocols');
const User = require('./models/User');
const Protocol = require('./models/Protocol');

// Main function
const main = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const isConnected = await connectDB();
    
    if (!isConnected) {
      console.error('Failed to connect to MongoDB. Make sure MongoDB is running.');
      process.exit(1);
    }
    
    // Get users from MongoDB
    const users = await User.find({});
    
    if (users.length === 0) {
      console.error('No users found in MongoDB. Please seed the database first.');
      process.exit(1);
    }
    
    const userIds = users.map(user => user._id.toString());
    
    // Count existing protocols
    const existingCount = await Protocol.countDocuments();
    console.log(`Found ${existingCount} existing protocols in MongoDB`);
    
    // Generate protocols
    const count = process.argv[2] ? parseInt(process.argv[2]) : 5000;
    console.log(`\nGenerating ${count} protocols...`);
    
    // Generate protocols in batches to avoid memory issues
    const batchSize = 100;
    const batches = Math.ceil(count / batchSize);
    
    let totalGenerated = 0;
    
    for (let i = 0; i < batches; i++) {
      const batchCount = Math.min(batchSize, count - (i * batchSize));
      console.log(`Generating batch ${i + 1}/${batches} (${batchCount} protocols)...`);
      
      const protocols = [];
      
      for (let j = 0; j < batchCount; j++) {
        const index = existingCount + totalGenerated + j + 1;
        const protocol = generateProtocol(index, userIds);
        
        // Convert to MongoDB model
        protocols.push({
          name: protocol.name,
          slug: protocol.id,
          description: protocol.description,
          category: protocol.category,
          author: userIds[Math.floor(Math.random() * userIds.length)],
          dateCreated: new Date(protocol.dateCreated),
          datePublished: protocol.datePublished ? new Date(protocol.datePublished) : null,
          publishTime: protocol.publishTime,
          status: protocol.status,
          imageUrl: protocol.imageUrl,
          keyFeatures: protocol.keyFeatures,
          steps: protocol.steps,
          materials: protocol.materials,
          equipment: protocol.equipment,
          visibility: protocol.visibility,
          rating: Math.random() * 5,
          efficiency: Math.random() * 5,
          consistency: Math.random() * 5,
          accuracy: Math.random() * 5,
          safety: Math.random() * 5,
          easeOfExecution: Math.random() * 5,
          scalability: Math.random() * 5
        });
      }
      
      // Insert protocols into MongoDB
      await Protocol.insertMany(protocols);
      
      totalGenerated += batchCount;
      console.log(`Progress: ${totalGenerated}/${count} protocols generated`);
    }
    
    // Count final protocols
    const finalCount = await Protocol.countDocuments();
    console.log(`\nFinal database state:`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Protocols: ${finalCount}`);
    
    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the main function
main(); 