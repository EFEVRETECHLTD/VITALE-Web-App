const express = require('express');
const router = express.Router();
const { generateProtocols } = require('../utils/generateProtocols');

// Route to generate protocols
router.post('/generate-protocols', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'This endpoint is only available in development mode' });
    }
    
    // Get count from request body or default to 200
    const count = req.body.count || 200;
    
    // Generate protocols
    const totalProtocols = generateProtocols(count);
    
    return res.status(200).json({ 
      message: `Successfully generated ${count} protocols`,
      totalProtocols
    });
  } catch (error) {
    console.error('Error generating protocols:', error);
    return res.status(500).json({ message: 'Error generating protocols' });
  }
});

module.exports = router; 