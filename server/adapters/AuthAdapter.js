/**
 * AuthAdapter Interface
 * 
 * This interface defines the methods that any authentication adapter must implement
 * to be compatible with the VITALE Protocol Library.
 */
class AuthAdapter {
  /**
   * Initialize the authentication system
   * @returns {Promise<boolean>} True if initialization is successful
   */
  async initialize() {
    throw new Error('Method not implemented');
  }

  /**
   * Authenticate a request
   * @param {Object} req - Express request object
   * @returns {Promise<Object|null>} User object if authenticated, null otherwise
   */
  async authenticate(req) {
    throw new Error('Method not implemented');
  }

  /**
   * Middleware for protecting routes
   * @returns {Function} Express middleware function
   */
  protect() {
    return async (req, res, next) => {
      try {
        const user = await this.authenticate(req);
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
      } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Authentication error' });
      }
    };
  }

  /**
   * Check if a user has a specific role
   * @param {Object} user - User object
   * @param {string|Array} roles - Role or array of roles to check
   * @returns {boolean} True if user has the role
   */
  hasRole(user, roles) {
    throw new Error('Method not implemented');
  }

  /**
   * Middleware for role-based access control
   * @param {string|Array} roles - Role or array of roles required
   * @returns {Function} Express middleware function
   */
  requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (!this.hasRole(req.user, roles)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      next();
    };
  }
}

module.exports = AuthAdapter; 