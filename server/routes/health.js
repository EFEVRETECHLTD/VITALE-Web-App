const express = require('express');
const router = express.Router();
const os = require('os');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthData = {
      status: 'UP',
      timestamp: new Date(),
      uptime: process.uptime(),
      host: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: os.totalmem(),
          free: os.freemem()
        }
      },
      services: {
        database: global.isMongoConnected ? 'UP' : 'DOWN',
        cache: global.isRedisConnected ? 'UP' : 'DOWN'
      }
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'DOWN',
      error: error.message 
    });
  }
});

// Detailed health check for monitoring systems
router.get('/details', async (req, res) => {
  try {
    const loadAvg = os.loadavg();
    const healthData = {
      status: 'UP',
      timestamp: new Date(),
      uptime: process.uptime(),
      host: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        cpus: os.cpus().length,
        loadAverage: {
          '1m': loadAvg[0],
          '5m': loadAvg[1],
          '15m': loadAvg[2]
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          usedPercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        network: os.networkInterfaces()
      },
      process: {
        pid: process.pid,
        memoryUsage: process.memoryUsage(),
        version: process.version
      },
      services: {
        database: global.isMongoConnected ? 'UP' : 'DOWN',
        cache: global.isRedisConnected ? 'UP' : 'DOWN'
      }
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({ 
      status: 'DOWN',
      error: error.message 
    });
  }
});

module.exports = router; 