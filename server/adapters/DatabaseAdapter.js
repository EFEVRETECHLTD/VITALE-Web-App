/**
 * DatabaseAdapter Interface
 * 
 * This interface defines the methods that any database adapter must implement
 * to be compatible with the VITALE Protocol Library.
 */
class DatabaseAdapter {
  /**
   * Initialize the database connection
   * @returns {Promise<boolean>} True if connection is successful
   */
  async connect() {
    throw new Error('Method not implemented');
  }

  /**
   * Get all protocols with optional filtering
   * @param {Object} filters - Optional filters to apply
   * @returns {Promise<Array>} Array of protocol objects
   */
  async getProtocols(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get a single protocol by ID
   * @param {string} id - Protocol ID
   * @returns {Promise<Object|null>} Protocol object or null if not found
   */
  async getProtocolById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new protocol
   * @param {Object} protocol - Protocol data
   * @returns {Promise<Object>} Created protocol
   */
  async createProtocol(protocol) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing protocol
   * @param {string} id - Protocol ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated protocol or null if not found
   */
  async updateProtocol(id, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a protocol
   * @param {string} id - Protocol ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteProtocol(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get reviews for a protocol
   * @param {string} protocolId - Protocol ID
   * @returns {Promise<Array>} Array of review objects
   */
  async getReviews(protocolId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a review to a protocol
   * @param {string} protocolId - Protocol ID
   * @param {Object} review - Review data
   * @returns {Promise<Object>} Created review
   */
  async addReview(protocolId, review) {
    throw new Error('Method not implemented');
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('Method not implemented');
  }
}

module.exports = DatabaseAdapter; 