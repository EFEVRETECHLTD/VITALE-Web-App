const axios = require('axios');
const jwt = require('jsonwebtoken');
const AuthAdapter = require('./AuthAdapter');

/**
 * Keycloak Authentication Adapter
 * 
 * Implementation of the AuthAdapter interface for Keycloak
 */
class KeycloakAuthAdapter extends AuthAdapter {
  /**
   * Constructor
   * @param {Object} options - Keycloak configuration options
   */
  constructor(options = {}) {
    super();
    this.options = {
      serverUrl: options.serverUrl || process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
      realm: options.realm || process.env.KEYCLOAK_REALM || 'vitale',
      clientId: options.clientId || process.env.KEYCLOAK_CLIENT_ID || 'vitale-client',
      clientSecret: options.clientSecret || process.env.KEYCLOAK_CLIENT_SECRET,
      publicKey: options.publicKey || process.env.KEYCLOAK_PUBLIC_KEY,
      adminUsername: options.adminUsername || process.env.KEYCLOAK_ADMIN_USERNAME,
      adminPassword: options.adminPassword || process.env.KEYCLOAK_ADMIN_PASSWORD,
    };
    
    // Format the public key for JWT verification
    if (this.options.publicKey) {
      this.formattedPublicKey = `-----BEGIN PUBLIC KEY-----\n${this.options.publicKey}\n-----END PUBLIC KEY-----`;
    }
  }

  /**
   * Initialize the authentication system
   * @returns {Promise<boolean>} True if initialization is successful
   */
  async initialize() {
    try {
      // If no public key is provided, fetch it from Keycloak
      if (!this.options.publicKey) {
        await this.fetchPublicKey();
      }
      
      console.log(`Keycloak authentication adapter initialized for realm: ${this.options.realm}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize Keycloak authentication adapter:', error);
      throw error;
    }
  }

  /**
   * Fetch the public key from Keycloak
   * @private
   */
  async fetchPublicKey() {
    try {
      const response = await axios.get(
        `${this.options.serverUrl}/realms/${this.options.realm}`
      );
      
      if (response.data && response.data.public_key) {
        this.options.publicKey = response.data.public_key;
        this.formattedPublicKey = `-----BEGIN PUBLIC KEY-----\n${this.options.publicKey}\n-----END PUBLIC KEY-----`;
      } else {
        throw new Error('Public key not found in Keycloak response');
      }
    } catch (error) {
      console.error('Error fetching Keycloak public key:', error);
      throw error;
    }
  }

  /**
   * Authenticate a request
   * @param {Object} req - Express request object
   * @returns {Promise<Object|null>} User object if authenticated, null otherwise
   */
  async authenticate(req) {
    try {
      // Extract the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      
      const token = authHeader.split(' ')[1];
      if (!token) {
        return null;
      }
      
      // Verify the token
      const decoded = jwt.verify(token, this.formattedPublicKey, {
        algorithms: ['RS256'],
        audience: this.options.clientId,
        issuer: `${this.options.serverUrl}/realms/${this.options.realm}`
      });
      
      // Extract user information from the token
      const user = {
        id: decoded.sub,
        username: decoded.preferred_username,
        email: decoded.email,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        roles: decoded.realm_access?.roles || [],
        resourceRoles: decoded.resource_access?.[this.options.clientId]?.roles || []
      };
      
      return user;
    } catch (error) {
      console.error('Error authenticating with Keycloak:', error);
      return null;
    }
  }

  /**
   * Check if a user has a specific role
   * @param {Object} user - User object
   * @param {string|Array} roles - Role or array of roles to check
   * @returns {boolean} True if user has the role
   */
  hasRole(user, roles) {
    if (!user || !user.roles) {
      return false;
    }
    
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    
    // Check realm roles
    for (const role of rolesToCheck) {
      if (user.roles.includes(role)) {
        return true;
      }
    }
    
    // Check resource roles
    if (user.resourceRoles) {
      for (const role of rolesToCheck) {
        if (user.resourceRoles.includes(role)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Get user info from Keycloak
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserInfo(userId) {
    try {
      // First, get an admin token
      const tokenResponse = await axios.post(
        `${this.options.serverUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: this.options.adminUsername,
          password: this.options.adminPassword
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const adminToken = tokenResponse.data.access_token;
      
      // Use the admin token to get user info
      const userResponse = await axios.get(
        `${this.options.serverUrl}/admin/realms/${this.options.realm}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      
      return userResponse.data;
    } catch (error) {
      console.error(`Error getting user info for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get all users from Keycloak
   * @returns {Promise<Array>} Array of user objects
   */
  async getUsers() {
    try {
      // First, get an admin token
      const tokenResponse = await axios.post(
        `${this.options.serverUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: this.options.adminUsername,
          password: this.options.adminPassword
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const adminToken = tokenResponse.data.access_token;
      
      // Use the admin token to get all users
      const usersResponse = await axios.get(
        `${this.options.serverUrl}/admin/realms/${this.options.realm}/users`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      
      return usersResponse.data;
    } catch (error) {
      console.error('Error getting users from Keycloak:', error);
      return [];
    }
  }
}

module.exports = KeycloakAuthAdapter; 