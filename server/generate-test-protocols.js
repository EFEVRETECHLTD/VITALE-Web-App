// Script to generate test protocols
require('dotenv').config();

// Set environment variables for testing
process.env.ALLOW_IN_MEMORY = 'true';
process.env.USE_MONGODB = 'false';

// Import required modules
const { seedDatabase, getInMemoryDB } = require('./utils/seeder');
const { generateProtocols } = require('./utils/generateProtocols');

// Main function
const main = async () => {
  try {
    console.log('Initializing in-memory database...');
    await seedDatabase();
    
    console.log('Initial database state:');
    const initialDb = getInMemoryDB();
    console.log(`- Users: ${initialDb.users.length}`);
    console.log(`- Protocols: ${initialDb.protocols.length}`);
    console.log(`- Reviews: ${initialDb.reviews.length}`);
    
    // Generate protocols
    const count = process.argv[2] ? parseInt(process.argv[2]) : 200;
    console.log(`\nGenerating ${count} protocols...`);
    const totalProtocols = generateProtocols(count, initialDb);
    
    console.log('\nFinal database state:');
    const finalDb = getInMemoryDB();
    console.log(`- Users: ${finalDb.users.length}`);
    console.log(`- Protocols: ${finalDb.protocols.length}`);
    console.log(`- Reviews: ${finalDb.reviews.length}`);
    
    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the main function
main(); 