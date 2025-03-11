const mongoose = require('mongoose');
const { protocols } = require('../src/data/protocols');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Protocol Schema (must match the one in server.js)
const protocolSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  datePublished: { type: String },
  publishTime: { type: String },
  rating: { type: Number, default: 0 },
  efficiency: { type: Number, default: 0 },
  consistency: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  safety: { type: Number, default: 0 },
  easeOfExecution: { type: Number, default: 0 },
  scalability: { type: Number, default: 0 },
  dateCreated: { type: String },
  status: { type: String, default: 'draft' },
  imageUrl: { type: String },
  keyFeatures: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Model
const Protocol = mongoose.model('Protocol', protocolSchema);

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing protocols
    await Protocol.deleteMany({});
    console.log('Cleared existing protocols');
    
    // Insert protocols from the data file
    await Protocol.insertMany(protocols);
    console.log(`Inserted ${protocols.length} protocols`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.disconnect();
  }
};

// Run the seed function
seedDatabase(); 