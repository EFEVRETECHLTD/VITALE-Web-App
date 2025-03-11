Write-Host "Seeding MongoDB database with initial data..."
Write-Host "-----------------------------------"

# Store current directory
$currentDir = Get-Location

try {
    # Change to the server directory
    Set-Location "$currentDir\server"
    
    # Set environment variables
    $env:ALLOW_IN_MEMORY = "true"
    $env:USE_MONGODB = "true"
    $env:MONGODB_URI = "mongodb://localhost:27017/instrument-status"
    
    # Create a temporary seed script
    $seedScript = @"
// Script to seed MongoDB with initial data
require('dotenv').config();

// Set environment variables
process.env.ALLOW_IN_MEMORY = 'true';
process.env.USE_MONGODB = 'true';

const { connectDB } = require('./config/db');
const { mockUsers, mockProtocols, mockReviews, getPreHashedUsers } = require('./utils/mockData');
const User = require('./models/User');
const Protocol = require('./models/Protocol');
const Review = require('./models/Review');

const seedMongoDB = async () => {
  try {
    // Connect to MongoDB
    const isConnected = await connectDB();
    
    if (!isConnected) {
      console.error('Failed to connect to MongoDB. Make sure MongoDB is running.');
      process.exit(1);
    }
    
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
    
    console.log(`\${createdUsers.length} users created`);
    
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
    
    console.log(`\${createdProtocols.length} protocols created`);
    
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
    
    console.log(`\${createdReviews.length} reviews created`);
    
    console.log('\nMongoDB seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding MongoDB: \${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedMongoDB();
"@
    
    # Write the seed script to a temporary file
    $seedScript | Out-File -FilePath "temp-seed-mongodb.js" -Encoding utf8
    
    # Run the seed script
    node temp-seed-mongodb.js
    
    # Remove the temporary file
    Remove-Item -Path "temp-seed-mongodb.js"
    
    Write-Host "-----------------------------------"
    Write-Host "MongoDB seeding complete!"
    Write-Host "-----------------------------------"
} catch {
    Write-Host "Error: $_"
} finally {
    # Return to the original directory
    Set-Location $currentDir
} 