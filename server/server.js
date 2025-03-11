const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import seeder
const { seedDatabase, getInMemoryDB } = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.10.110:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database variables
let isMongoConnected = false;
let db = {
  users: [],
  protocols: [],
  reviews: []
};

// Models (will be used if MongoDB is connected)
let User, Protocol, Review;

// Initialize database
const initializeDatabase = async () => {
  try {
    // Try to connect to MongoDB
    isMongoConnected = await connectDB();
    
    if (isMongoConnected) {
      console.log('Using MongoDB database');
      // Import models if MongoDB is connected
      User = require('./models/User');
      Protocol = require('./models/Protocol');
      Review = require('./models/Review');
    } else {
      console.log('Using in-memory database');
      // Use in-memory database
      await seedDatabase();
      db = getInMemoryDB();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Register a new user
app.post('/api/users/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.username);
    const { username, email, password, jobPosition } = req.body;
    
    if (isMongoConnected) {
      // MongoDB implementation
      // Check if user exists
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const newUser = new User({
        username,
        email,
        password, // Will be hashed by the pre-save middleware
        jobPosition: jobPosition || 'Lab Technician'
      });
      
      await newUser.save();
      
      console.log(`Registration successful: User ${username}`);
      res.status(201).json({ message: 'User registered successfully' });
    } else {
      // In-memory implementation
      // Check if user already exists
      const existingUser = db.users.find(user => 
        user.username === username || user.email === email
      );
      
      if (existingUser) {
        console.log(`Registration failed: User ${username} or email ${email} already exists`);
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        jobPosition: jobPosition || 'Lab Technician',
        role: 'user',
        createdAt: new Date()
      };
      
      db.users.push(newUser);
      
      console.log(`Registration successful: User ${username}`);
      res.status(201).json({ message: 'User registered successfully' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.username);
    const { username, password } = req.body;
    
    if (isMongoConnected) {
      // MongoDB implementation
      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Validate password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'fallback_jwt_secret',
        { expiresIn: '1d' }
      );
      
      console.log(`Login successful: User ${username}`);
      
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          jobPosition: user.jobPosition,
          role: user.role,
          profileImage: user.profileImage
        }
      });
    } else {
      // In-memory implementation
      // Find user
      const user = db.users.find(user => user.username === username);
      if (!user) {
        console.log(`Login failed: User ${username} not found`);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`Login failed: Invalid password for user ${username}`);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'user' },
        process.env.JWT_SECRET || 'fallback_jwt_secret',
        { expiresIn: '1d' }
      );
      
      console.log(`Login successful: User ${username}`);
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          jobPosition: user.jobPosition || 'Lab Technician',
          role: user.role || 'user',
          profileImage: user.profileImage || '/images/default-profile.png'
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user data
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    if (isMongoConnected) {
      // MongoDB implementation
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        jobPosition: user.jobPosition,
        role: user.role,
        profileImage: user.profileImage,
        department: user.department
      });
    } else {
      // In-memory implementation
      const user = db.users.find(user => user.id === req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        jobPosition: user.jobPosition || 'Lab Technician',
        role: user.role || 'user',
        profileImage: user.profileImage || '/images/default-profile.png',
        department: user.department || 'Research & Development'
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all protocols
app.get('/api/protocols', async (req, res) => {
  try {
    if (isMongoConnected) {
      // MongoDB implementation
      const protocols = await Protocol.find({ status: 'published' })
        .populate('author', 'username profileImage')
        .select('-__v');
      
      res.json(protocols);
    } else {
      // In-memory implementation
      res.json(db.protocols);
    }
  } catch (error) {
    console.error('Get protocols error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get protocol by ID
app.get('/api/protocols/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      // MongoDB implementation
      const protocol = await Protocol.findOne({ 
        $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }]
      }).populate('author', 'username profileImage');
      
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      res.json(protocol);
    } else {
      // In-memory implementation
      const protocol = db.protocols.find(p => p.id === req.params.id);
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      res.json(protocol);
    }
  } catch (error) {
    console.error('Get protocol error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new protocol (protected route)
app.post('/api/protocols', authenticateToken, async (req, res) => {
  try {
    const protocolData = req.body;
    
    if (isMongoConnected) {
      // MongoDB implementation
      // Create new protocol
      const newProtocol = new Protocol({
        name: protocolData.name,
        description: protocolData.description,
        category: protocolData.category,
        author: req.user.id,
        status: protocolData.status || 'draft',
        imageUrl: protocolData.imageUrl,
        keyFeatures: protocolData.keyFeatures,
        steps: protocolData.steps,
        materials: protocolData.materials,
        equipment: protocolData.equipment,
        visibility: protocolData.visibility || 'private'
      });
      
      // If protocol is published, set publish date
      if (newProtocol.status === 'published') {
        newProtocol.datePublished = new Date();
        newProtocol.publishTime = new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      await newProtocol.save();
      
      res.status(201).json(newProtocol);
    } else {
      // In-memory implementation
      // Generate a unique ID based on the name
      const id = protocolData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if protocol with this ID already exists
      const existingProtocol = db.protocols.find(p => p.id === id);
      if (existingProtocol) {
        return res.status(400).json({ message: 'Protocol with similar name already exists' });
      }
      
      // Create new protocol
      const newProtocol = {
        ...protocolData,
        id,
        author: req.user.id,
        dateCreated: new Date().toISOString().split('T')[0],
        status: protocolData.status || 'draft'
      };
      
      // If protocol is published, set publish date
      if (newProtocol.status === 'published') {
        newProtocol.datePublished = new Date().toISOString().split('T')[0];
        newProtocol.publishTime = new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      db.protocols.push(newProtocol);
      
      res.status(201).json(newProtocol);
    }
  } catch (error) {
    console.error('Create protocol error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a review to a protocol (protected route)
app.post('/api/protocols/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, title, comment, metrics, attachments } = req.body;
    
    if (isMongoConnected) {
      // MongoDB implementation
      // Find the protocol
      const protocol = await Protocol.findOne({ 
        $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }]
      });
      
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Check if user already reviewed this protocol
      const existingReview = await Review.findOne({
        protocol: protocol._id,
        user: req.user.id
      });
      
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this protocol' });
      }
      
      // Create new review
      const newReview = new Review({
        protocol: protocol._id,
        user: req.user.id,
        rating,
        title,
        comment,
        metrics,
        attachments: attachments || []
      });
      
      await newReview.save();
      
      res.status(201).json(newReview);
    } else {
      // In-memory implementation
      // Find the protocol
      const protocol = db.protocols.find(p => p.id === req.params.id);
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Check if user already reviewed this protocol
      const existingReview = db.reviews.find(r => 
        r.protocol === protocol.id && r.user === req.user.id
      );
      
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this protocol' });
      }
      
      // Create new review
      const newReview = {
        id: Date.now().toString(),
        protocol: protocol.id,
        user: req.user.id,
        rating,
        title,
        comment,
        metrics,
        attachments: attachments || [],
        dateCreated: new Date().toISOString().split('T')[0],
        verified: false
      };
      
      db.reviews.push(newReview);
      
      // Update protocol rating
      const protocolReviews = db.reviews.filter(r => r.protocol === protocol.id);
      if (protocolReviews.length > 0) {
        const totalRating = protocolReviews.reduce((sum, r) => sum + r.rating, 0);
        protocol.rating = (totalRating / protocolReviews.length).toFixed(1);
        
        // Update metrics
        if (metrics) {
          const metricsFields = ['efficiency', 'consistency', 'accuracy', 'safety', 'easeOfExecution', 'scalability'];
          metricsFields.forEach(field => {
            if (metrics[field]) {
              const totalMetric = protocolReviews.reduce((sum, r) => sum + (r.metrics?.[field] || 0), 0);
              protocol[field] = (totalMetric / protocolReviews.length).toFixed(1);
            }
          });
        }
      }
      
      res.status(201).json(newReview);
    }
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a protocol
app.get('/api/protocols/:id/reviews', async (req, res) => {
  try {
    if (isMongoConnected) {
      // MongoDB implementation
      // Find the protocol
      const protocol = await Protocol.findOne({ 
        $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }]
      });
      
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Get reviews
      const reviews = await Review.find({ protocol: protocol._id })
        .populate('user', 'username profileImage')
        .sort({ dateCreated: -1 });
      
      res.json(reviews);
    } else {
      // In-memory implementation
      // Find the protocol
      const protocol = db.protocols.find(p => p.id === req.params.id);
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Get reviews
      const reviews = db.reviews.filter(r => r.protocol === protocol.id);
      
      // Add user data to reviews
      const reviewsWithUserData = reviews.map(review => {
        const user = db.users.find(u => u.id === review.user);
        return {
          ...review,
          user: user ? {
            id: user.id,
            username: user.username,
            profileImage: user.profileImage || '/images/default-profile.png'
          } : { username: 'Unknown User' }
        };
      });
      
      res.json(reviewsWithUserData);
    }
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's review for a protocol (protected route)
app.get('/api/protocols/:id/reviews/user', authenticateToken, async (req, res) => {
  try {
    if (isMongoConnected) {
      // MongoDB implementation
      // Find the protocol
      const protocol = await Protocol.findOne({ 
        $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }]
      });
      
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Find user's review for this protocol
      const review = await Review.findOne({
        protocol: protocol._id,
        user: req.user.id
      });
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      res.status(200).json(review);
    } else {
      // In-memory implementation
      // Find the protocol
      const protocol = db.protocols.find(p => p.id === req.params.id);
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Find user's review for this protocol
      const review = db.reviews.find(r => 
        r.protocol === protocol.id && r.user === req.user.id
      );
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      res.status(200).json(review);
    }
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an existing review (protected route)
app.put('/api/protocols/:id/reviews/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { rating, title, comment, metrics, attachments } = req.body;
    
    if (isMongoConnected) {
      // MongoDB implementation
      // Find the protocol
      const protocol = await Protocol.findOne({ 
        $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }]
      });
      
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Find the review
      const review = await Review.findById(req.params.reviewId);
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Check if the review belongs to the user
      if (review.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this review' });
      }
      
      // Update review
      review.rating = rating;
      review.title = title;
      review.comment = comment;
      review.metrics = metrics;
      review.attachments = attachments || [];
      
      await review.save();
      
      res.status(200).json(review);
    } else {
      // In-memory implementation
      // Find the protocol
      const protocol = db.protocols.find(p => p.id === req.params.id);
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Find the review
      const reviewIndex = db.reviews.findIndex(r => r.id === req.params.reviewId);
      
      if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      const review = db.reviews[reviewIndex];
      
      // Check if the review belongs to the user
      if (review.user !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this review' });
      }
      
      // Update review
      db.reviews[reviewIndex] = {
        ...review,
        rating,
        title,
        comment,
        metrics,
        attachments: attachments || []
      };
      
      // Update protocol rating
      const protocolReviews = db.reviews.filter(r => r.protocol === protocol.id);
      if (protocolReviews.length > 0) {
        const totalRating = protocolReviews.reduce((sum, r) => sum + r.rating, 0);
        protocol.rating = (totalRating / protocolReviews.length).toFixed(1);
        
        // Update metrics averages if they exist
        if (protocolReviews.some(r => r.metrics)) {
          const metricFields = ['efficiency', 'consistency', 'accuracy', 'safety', 'easeOfExecution', 'scalability'];
          
          metricFields.forEach(field => {
            const reviewsWithMetric = protocolReviews.filter(r => r.metrics && r.metrics[field]);
            if (reviewsWithMetric.length > 0) {
              const totalMetric = reviewsWithMetric.reduce((sum, r) => sum + r.metrics[field], 0);
              protocol[field] = (totalMetric / reviewsWithMetric.length).toFixed(1);
            }
          });
        }
      }
      
      res.status(200).json(db.reviews[reviewIndex]);
    }
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all protocols (public route)
app.get('/api/protocols', async (req, res) => {
  try {
    if (isMongoConnected) {
      // MongoDB implementation
      const protocols = await Protocol.find({ status: 'published' })
        .populate('author', 'username profileImage')
        .select('-__v');
      
      res.json(protocols);
    } else {
      // In-memory implementation
      res.json(db.protocols);
    }
  } catch (error) {
    console.error('Get protocols error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();