/**
 * Adapter Factory
 * 
 * Factory class to create and manage database and authentication adapters
 */
class AdapterFactory {
  constructor() {
    this.dbAdapter = null;
    this.authAdapter = null;
  }

  /**
   * Create a database adapter
   * @param {string} type - Type of database adapter
   * @param {Object} options - Options for the adapter
   * @returns {Object} Database adapter instance
   */
  createDatabaseAdapter(type, options = {}) {
    try {
      let AdapterClass;
      
      switch (type.toLowerCase()) {
        case 'inmemory':
          AdapterClass = require('./InMemoryDatabaseAdapter');
          break;
        case 'postgresql':
          AdapterClass = require('./PostgreSQLDatabaseAdapter');
          break;
        // Add more adapter types as needed
        default:
          throw new Error(`Unknown database adapter type: ${type}`);
      }
      
      this.dbAdapter = new AdapterClass(options);
      return this.dbAdapter;
    } catch (error) {
      console.error(`Error creating database adapter of type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Create an authentication adapter
   * @param {string} type - Type of authentication adapter
   * @param {Object} options - Options for the adapter
   * @returns {Object} Authentication adapter instance
   */
  createAuthAdapter(type, options = {}) {
    try {
      let AdapterClass;
      
      switch (type.toLowerCase()) {
        case 'jwt':
          AdapterClass = require('./JwtAuthAdapter');
          break;
        case 'keycloak':
          AdapterClass = require('./KeycloakAuthAdapter');
          break;
        // Add more adapter types as needed
        default:
          throw new Error(`Unknown authentication adapter type: ${type}`);
      }
      
      this.authAdapter = new AdapterClass(options);
      return this.authAdapter;
    } catch (error) {
      console.error(`Error creating authentication adapter of type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Get the current database adapter
   * @returns {Object} Database adapter instance
   */
  getDatabaseAdapter() {
    if (!this.dbAdapter) {
      throw new Error('Database adapter not initialized');
    }
    return this.dbAdapter;
  }

  /**
   * Get the current authentication adapter
   * @returns {Object} Authentication adapter instance
   */
  getAuthAdapter() {
    if (!this.authAdapter) {
      throw new Error('Authentication adapter not initialized');
    }
    return this.authAdapter;
  }
}

// Create a singleton instance
const factory = new AdapterFactory();

module.exports = factory; 