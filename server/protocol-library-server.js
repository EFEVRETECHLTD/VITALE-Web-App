const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
const adapterFactory = require('./adapters/AdapterFactory');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Initialize adapters based on environment variables
const initializeAdapters = async () => {
  try {
    // Determine which database adapter to use
    const dbType = process.env.DB_TYPE || 'postgresql'; // Default to PostgreSQL
    
    // Create database adapter
    switch (dbType.toLowerCase()) {
      case 'inmemory':
        console.log('Using in-memory database');
        const InMemoryDatabaseAdapter = require('./adapters/InMemoryDatabaseAdapter');
        dbAdapter = new InMemoryDatabaseAdapter({
          protocolsFilePath: path.join(__dirname, 'data/generated-protocols.json')
        });
        break;
      case 'mongodb':
        console.log('Using MongoDB database');
        const MongoDBDatabaseAdapter = require('./adapters/MongoDBDatabaseAdapter');
        dbAdapter = new MongoDBDatabaseAdapter();
        break;
      case 'postgresql':
      default:
        console.log('Using PostgreSQL database');
        const PostgreSQLDatabaseAdapter = require('./adapters/PostgreSQLDatabaseAdapter');
        dbAdapter = new PostgreSQLDatabaseAdapter();
        break;
    }
    
    // Initialize database adapter
    await dbAdapter.connect();
    
    // Determine which authentication adapter to use
    const authType = process.env.AUTH_TYPE || 'jwt'; // Default to JWT
    
    // Create authentication adapter
    switch (authType.toLowerCase()) {
      case 'keycloak':
        console.log('Using Keycloak authentication');
        const KeycloakAuthAdapter = require('./adapters/KeycloakAuthAdapter');
        authAdapter = new KeycloakAuthAdapter();
        break;
      case 'jwt':
      default:
        console.log('Using JWT authentication');
        const JwtAuthAdapter = require('./adapters/JwtAuthAdapter');
        authAdapter = new JwtAuthAdapter();
        break;
    }
    
    // Initialize authentication adapter
    await authAdapter.initialize();
    
    console.log(`Database adapter (${dbType}) initialized successfully`);
    console.log(`Authentication adapter (${authType}) initialized successfully`);
  } catch (error) {
    console.error('Error initializing adapters:', error);
    throw error;
  }
};

// API Routes
const setupRoutes = (dbAdapter, authAdapter) => {
  // Get all protocols
  app.get('/api/protocols', async (req, res) => {
    try {
      const filters = {
        category: req.query.category,
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        page: req.query.page,
        limit: req.query.limit
      };
      
      const protocols = await dbAdapter.getProtocols(filters);
      
      res.json({
        count: protocols.length,
        protocols
      });
    } catch (error) {
      console.error('Error getting protocols:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get a single protocol
  app.get('/api/protocols/:id', async (req, res) => {
    try {
      const protocol = await dbAdapter.getProtocolById(req.params.id);
      
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      res.json(protocol);
    } catch (error) {
      console.error(`Error getting protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Create a protocol (protected)
  app.post('/api/protocols', authAdapter.protect(), async (req, res) => {
    try {
      const protocol = await dbAdapter.createProtocol({
        ...req.body,
        author: req.user.id
      });
      
      res.status(201).json(protocol);
    } catch (error) {
      console.error('Error creating protocol:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update a protocol (protected)
  app.put('/api/protocols/:id', authAdapter.protect(), async (req, res) => {
    try {
      const protocol = await dbAdapter.getProtocolById(req.params.id);
      
      if (!protocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      // Check if user is the author or an admin
      if (protocol.author !== req.user.id && !authAdapter.hasRole(req.user, 'admin')) {
        return res.status(403).json({ message: 'Not authorized to update this protocol' });
      }
      
      const updatedProtocol = await dbAdapter.updateProtocol(req.params.id, req.body);
      
      res.json(updatedProtocol);
    } catch (error) {
      console.error(`Error updating protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Delete a protocol (protected)
  app.delete('/api/protocols/:id', authAdapter.protect(), authAdapter.requireRole('admin'), async (req, res) => {
    try {
      const success = await dbAdapter.deleteProtocol(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
      
      res.json({ message: 'Protocol deleted successfully' });
    } catch (error) {
      console.error(`Error deleting protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get reviews for a protocol
  app.get('/api/protocols/:id/reviews', async (req, res) => {
    try {
      const reviews = await dbAdapter.getReviews(req.params.id);
      
      res.json(reviews);
    } catch (error) {
      console.error(`Error getting reviews for protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Add a review to a protocol (protected)
  app.post('/api/protocols/:id/reviews', authAdapter.protect(), async (req, res) => {
    try {
      const review = await dbAdapter.addReview(req.params.id, {
        ...req.body,
        user_id: req.user.id
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error(`Error adding review to protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get bookmarked protocols for the current user (protected)
  app.get('/api/bookmarks', authAdapter.protect(), async (req, res) => {
    try {
      const protocols = await dbAdapter.getBookmarkedProtocols(req.user.id);
      
      res.json({
        count: protocols.length,
        protocols
      });
    } catch (error) {
      console.error('Error getting bookmarked protocols:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Add a bookmark (protected)
  app.post('/api/protocols/:id/bookmark', authAdapter.protect(), async (req, res) => {
    try {
      const bookmark = await dbAdapter.addBookmark(req.user.id, req.params.id);
      
      res.status(201).json(bookmark);
    } catch (error) {
      console.error(`Error bookmarking protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Remove a bookmark (protected)
  app.delete('/api/protocols/:id/bookmark', authAdapter.protect(), async (req, res) => {
    try {
      const success = await dbAdapter.removeBookmark(req.user.id, req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Bookmark not found' });
      }
      
      res.json({ message: 'Bookmark removed successfully' });
    } catch (error) {
      console.error(`Error removing bookmark for protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get "Works for Me" protocols for the current user (protected)
  app.get('/api/works-for-me', authAdapter.protect(), async (req, res) => {
    try {
      const protocols = await dbAdapter.getWorksForMeProtocols(req.user.id);
      
      res.json({
        count: protocols.length,
        protocols
      });
    } catch (error) {
      console.error('Error getting "Works for Me" protocols:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Mark a protocol as "Works for Me" (protected)
  app.post('/api/protocols/:id/works-for-me', authAdapter.protect(), async (req, res) => {
    try {
      // Add a review with works_for_me flag set to true
      const review = await dbAdapter.addReview(req.params.id, {
        user_id: req.user.id,
        rating: req.body.rating || 5, // Default to 5 stars if not provided
        comment: req.body.comment || '',
        works_for_me: true
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error(`Error marking protocol ${req.params.id} as "Works for Me":`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Remove "Works for Me" mark from a protocol (protected)
  app.delete('/api/protocols/:id/works-for-me', authAdapter.protect(), async (req, res) => {
    try {
      // Find the review with works_for_me flag
      const reviews = await dbAdapter.getReviews(req.params.id);
      const userReview = reviews.find(r => r.user_id === req.user.id && r.works_for_me);
      
      if (!userReview) {
        return res.status(404).json({ message: 'Works for me mark not found' });
      }
      
      // Delete the review
      const success = await dbAdapter.deleteReview(userReview.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Get updated protocol to return the new works_for_me count
      const protocol = await dbAdapter.getProtocolById(req.params.id);
      
      res.json({ 
        message: 'Works for me mark removed successfully',
        worksForMeCount: protocol.worksForMeCount || 0
      });
    } catch (error) {
      console.error(`Error removing "Works for Me" mark from protocol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    const { dbAdapter, authAdapter } = await initializeAdapters();
    
    setupRoutes(dbAdapter, authAdapter);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access from other devices using: http://${getLocalIpAddress()}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Helper function to get local IP address
const getLocalIpAddress = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return 'localhost';
};

// Start the server
startServer(); 