const DatabaseAdapter = require('./DatabaseAdapter');
const fs = require('fs');
const path = require('path');

/**
 * In-Memory Database Adapter
 * 
 * Implementation of DatabaseAdapter for in-memory storage
 */
class InMemoryDatabaseAdapter extends DatabaseAdapter {
  constructor(options = {}) {
    super();
    this.db = {
      protocols: [],
      reviews: []
    };
    this.options = options;
    this.initialized = false;
  }

  /**
   * Initialize the in-memory database
   * @returns {Promise<boolean>} True if initialization is successful
   */
  async connect() {
    try {
      // Load initial data if provided
      if (this.options.initialData) {
        this.db = this.options.initialData;
      }
      
      // Load protocols from file if path is provided
      if (this.options.protocolsFilePath && fs.existsSync(this.options.protocolsFilePath)) {
        const protocols = JSON.parse(fs.readFileSync(this.options.protocolsFilePath, 'utf8'));
        this.db.protocols = protocols;
        console.log(`Loaded ${protocols.length} protocols from file`);
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing in-memory database:', error);
      return false;
    }
  }

  /**
   * Get all protocols with optional filtering
   * @param {Object} filters - Optional filters to apply
   * @returns {Promise<Array>} Array of protocol objects
   */
  async getProtocols(filters = {}) {
    try {
      let filteredProtocols = [...this.db.protocols];
      
      // Apply filters
      if (filters.category && filters.category !== 'all') {
        filteredProtocols = filteredProtocols.filter(p => p.category === filters.category);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProtocols = filteredProtocols.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        const { sortBy, sortDirection = 'asc' } = filters;
        filteredProtocols.sort((a, b) => {
          let valueA, valueB;
          
          if (sortBy === 'date') {
            valueA = new Date(a.datePublished);
            valueB = new Date(b.datePublished);
          } else if (sortBy === 'rating') {
            valueA = parseFloat(a.rating || 0);
            valueB = parseFloat(b.rating || 0);
          } else {
            valueA = a[sortBy];
            valueB = b[sortBy];
          }
          
          if (sortDirection === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
      }
      
      // Apply pagination
      if (filters.page && filters.limit) {
        const page = parseInt(filters.page);
        const limit = parseInt(filters.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        filteredProtocols = filteredProtocols.slice(startIndex, endIndex);
      }
      
      return filteredProtocols;
    } catch (error) {
      console.error('Error getting protocols:', error);
      return [];
    }
  }

  /**
   * Get a single protocol by ID
   * @param {string} id - Protocol ID
   * @returns {Promise<Object|null>} Protocol object or null if not found
   */
  async getProtocolById(id) {
    try {
      const protocol = this.db.protocols.find(p => p.id === id);
      return protocol || null;
    } catch (error) {
      console.error(`Error getting protocol ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new protocol
   * @param {Object} protocol - Protocol data
   * @returns {Promise<Object>} Created protocol
   */
  async createProtocol(protocol) {
    try {
      // Generate ID if not provided
      if (!protocol.id) {
        protocol.id = `protocol-${Date.now()}`;
      }
      
      // Add timestamps
      protocol.dateCreated = protocol.dateCreated || new Date().toISOString().split('T')[0];
      
      this.db.protocols.push(protocol);
      
      // Save to file if path is provided
      if (this.options.protocolsFilePath) {
        fs.writeFileSync(
          this.options.protocolsFilePath, 
          JSON.stringify(this.db.protocols, null, 2)
        );
      }
      
      return protocol;
    } catch (error) {
      console.error('Error creating protocol:', error);
      throw error;
    }
  }

  /**
   * Update an existing protocol
   * @param {string} id - Protocol ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated protocol or null if not found
   */
  async updateProtocol(id, updates) {
    try {
      const index = this.db.protocols.findIndex(p => p.id === id);
      if (index === -1) {
        return null;
      }
      
      // Update the protocol
      this.db.protocols[index] = {
        ...this.db.protocols[index],
        ...updates
      };
      
      // Save to file if path is provided
      if (this.options.protocolsFilePath) {
        fs.writeFileSync(
          this.options.protocolsFilePath, 
          JSON.stringify(this.db.protocols, null, 2)
        );
      }
      
      return this.db.protocols[index];
    } catch (error) {
      console.error(`Error updating protocol ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a protocol
   * @param {string} id - Protocol ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteProtocol(id) {
    try {
      const initialLength = this.db.protocols.length;
      this.db.protocols = this.db.protocols.filter(p => p.id !== id);
      
      // Also delete associated reviews
      this.db.reviews = this.db.reviews.filter(r => r.protocol !== id);
      
      // Save to file if path is provided
      if (this.options.protocolsFilePath) {
        fs.writeFileSync(
          this.options.protocolsFilePath, 
          JSON.stringify(this.db.protocols, null, 2)
        );
      }
      
      return this.db.protocols.length < initialLength;
    } catch (error) {
      console.error(`Error deleting protocol ${id}:`, error);
      return false;
    }
  }

  /**
   * Get reviews for a protocol
   * @param {string} protocolId - Protocol ID
   * @returns {Promise<Array>} Array of review objects
   */
  async getReviews(protocolId) {
    try {
      return this.db.reviews.filter(r => r.protocol === protocolId);
    } catch (error) {
      console.error(`Error getting reviews for protocol ${protocolId}:`, error);
      return [];
    }
  }

  /**
   * Add a review to a protocol
   * @param {string} protocolId - Protocol ID
   * @param {Object} review - Review data
   * @returns {Promise<Object>} Created review
   */
  async addReview(protocolId, review) {
    try {
      // Check if protocol exists
      const protocol = await this.getProtocolById(protocolId);
      if (!protocol) {
        throw new Error(`Protocol ${protocolId} not found`);
      }
      
      // Create review
      const newReview = {
        id: `review-${Date.now()}`,
        protocol: protocolId,
        dateCreated: new Date().toISOString().split('T')[0],
        ...review
      };
      
      this.db.reviews.push(newReview);
      
      // Update protocol rating
      const protocolReviews = await this.getReviews(protocolId);
      if (protocolReviews.length > 0) {
        const totalRating = protocolReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / protocolReviews.length).toFixed(1);
        await this.updateProtocol(protocolId, { rating: averageRating });
      }
      
      return newReview;
    } catch (error) {
      console.error(`Error adding review to protocol ${protocolId}:`, error);
      throw error;
    }
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    // No connection to close for in-memory database
    return;
  }
}

module.exports = InMemoryDatabaseAdapter; 