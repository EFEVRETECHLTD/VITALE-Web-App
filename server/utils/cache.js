const { createClient } = require('redis');

// Redis client configuration
let redisClient;
let redisConnected = false;

// Initialize Redis client
const initRedis = async () => {
  if (process.env.USE_REDIS !== 'true') {
    console.log('Redis caching disabled');
    return false;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          // Exponential backoff: 2^retries * 100ms
          return Math.min(Math.pow(2, retries) * 100, 10000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
      redisConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('Redis connection error:', error);
    return false;
  }
};

// Get data from cache
const getCache = async (key) => {
  if (!redisConnected) return null;
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

// Set data in cache with expiration
const setCache = async (key, data, expireSeconds = 3600) => {
  if (!redisConnected) return false;
  
  try {
    await redisClient.set(key, JSON.stringify(data), {
      EX: expireSeconds
    });
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

// Delete cache by key
const deleteCache = async (key) => {
  if (!redisConnected) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

// Clear cache by pattern
const clearCacheByPattern = async (pattern) => {
  if (!redisConnected) return false;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis clear pattern error:', error);
    return false;
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  deleteCache,
  clearCacheByPattern
}; 