const AuthAdapter = require('./AuthAdapter');
const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Adapter
 * 
 * Implementation of AuthAdapter for JWT authentication
 */
class JwtAuthAdapter extends AuthAdapter {
  constructor(options = {}) {
    super();
    this.options = {
      secret: process.env.JWT_SECRET || 'fallback_jwt_secret',
      expiresIn: '1d',
      ...options
    };
    this.initialized = false;
  }

  /**
   * Initialize the JWT authentication system
   * @returns {Promise<boolean>} True if initialization is successful
   */
  async initialize() {
    try {
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing JWT authentication:', error);
      return false;
    }
  }

  /**
   * Authenticate a request using JWT
   * @param {Object} req - Express request object
   * @returns {Promise<Object|null>} User object if authenticated, null otherwise
   */
  async authenticate(req) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return null;
      }
      
      const decoded = jwt.verify(token, this.options.secret);
      return decoded;
    } catch (error) {
      console.error('JWT authentication error:', error);
      return null;
    }
  }

  /**
   * Generate a JWT token for a user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role || 'user' 
      },
      this.options.secret,
      { expiresIn: this.options.expiresIn }
    );
  }

  /**
   * Check if a user has a specific role
   * @param {Object} user - User object
   * @param {string|Array} roles - Role or array of roles to check
   * @returns {boolean} True if user has the role
   */
  hasRole(user, roles) {
    if (!user || !user.role) {
      return false;
    }
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }
}

module.exports = JwtAuthAdapter; 