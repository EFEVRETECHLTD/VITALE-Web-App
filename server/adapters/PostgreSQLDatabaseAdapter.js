const { Pool } = require('pg');
const DatabaseAdapter = require('./DatabaseAdapter');

/**
 * PostgreSQL Database Adapter
 * 
 * Implementation of the DatabaseAdapter interface for PostgreSQL
 */
class PostgreSQLDatabaseAdapter extends DatabaseAdapter {
  /**
   * Constructor
   * @param {Object} options - Connection options
   */
  constructor(options = {}) {
    super();
    this.options = {
      host: options.host || process.env.POSTGRES_HOST || 'localhost',
      port: options.port || process.env.POSTGRES_PORT || 5432,
      database: options.database || process.env.POSTGRES_DB || 'vitale',
      user: options.user || process.env.POSTGRES_USER || 'postgres',
      password: options.password || process.env.POSTGRES_PASSWORD || 'postgres',
      ssl: options.ssl || (process.env.POSTGRES_SSL === 'true'),
      max: options.max || 20, // Maximum number of clients in the pool
      idleTimeoutMillis: options.idleTimeoutMillis || 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: options.connectionTimeoutMillis || 2000, // How long to wait for a connection
    };
    this.pool = null;
  }

  /**
   * Initialize the database connection
   * @returns {Promise<boolean>} True if connection is successful
   */
  async connect() {
    try {
      this.pool = new Pool(this.options);
      
      // Test the connection
      const client = await this.pool.connect();
      client.release();
      
      // Ensure tables exist
      await this._initializeTables();
      
      console.log('Connected to PostgreSQL database');
      return true;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL database:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables if they don't exist
   * @private
   */
  async _initializeTables() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create protocols table
      await client.query(`
        CREATE TABLE IF NOT EXISTS protocols (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          subcategory VARCHAR(100),
          author VARCHAR(100),
          date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          content JSONB,
          tags TEXT[],
          rating NUMERIC(3,2) DEFAULT 0,
          review_count INTEGER DEFAULT 0
        )
      `);

      // Create reviews table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          protocol_id INTEGER REFERENCES protocols(id) ON DELETE CASCADE,
          user_id VARCHAR(100) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
          comment TEXT,
          date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          works_for_me BOOLEAN DEFAULT FALSE
        )
      `);

      // Create bookmarks table
      await client.query(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id SERIAL PRIMARY KEY,
          protocol_id INTEGER REFERENCES protocols(id) ON DELETE CASCADE,
          user_id VARCHAR(100) NOT NULL,
          date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(protocol_id, user_id)
        )
      `);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error initializing database tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all protocols with optional filtering
   * @param {Object} filters - Optional filters to apply
   * @returns {Promise<Array>} Array of protocol objects
   */
  async getProtocols(filters = {}) {
    try {
      let query = 'SELECT * FROM protocols';
      const queryParams = [];
      const conditions = [];

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        conditions.push(`category = $${queryParams.length + 1}`);
        queryParams.push(filters.category);
      }

      if (filters.search) {
        conditions.push(`(name ILIKE $${queryParams.length + 1} OR description ILIKE $${queryParams.length + 1})`);
        queryParams.push(`%${filters.search}%`);
      }

      if (filters.minRating) {
        conditions.push(`rating >= $${queryParams.length + 1}`);
        queryParams.push(parseFloat(filters.minRating));
      }

      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Add sorting
      if (filters.sortBy) {
        let sortField;
        switch (filters.sortBy) {
          case 'date':
            sortField = 'date_published';
            break;
          case 'rating':
            sortField = 'rating';
            break;
          case 'name':
            sortField = 'name';
            break;
          default:
            sortField = 'name';
        }
        const sortOrder = filters.sortDirection === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;
      } else {
        query += ' ORDER BY name ASC';
      }

      // Add pagination
      if (filters.limit) {
        query += ` LIMIT $${queryParams.length + 1}`;
        queryParams.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ` OFFSET $${queryParams.length + 1}`;
          queryParams.push(parseInt(filters.offset));
        }
      }

      const result = await this.pool.query(query, queryParams);
      
      // Transform the database rows to match the expected format
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        author: row.author,
        dateCreated: row.date_created,
        datePublished: row.date_published,
        publishTime: row.publish_time,
        status: row.status,
        imageUrl: row.image_url,
        keyFeatures: row.key_features || [],
        steps: row.steps || [],
        materials: row.materials || [],
        equipment: row.equipment || [],
        visibility: row.visibility,
        rating: parseFloat(row.rating) || 0,
        efficiency: parseFloat(row.efficiency) || 0,
        consistency: parseFloat(row.consistency) || 0,
        accuracy: parseFloat(row.accuracy) || 0,
        safety: parseFloat(row.safety) || 0,
        easeOfExecution: parseFloat(row.ease_of_execution) || 0,
        scalability: parseFloat(row.scalability) || 0,
        worksForMeCount: row.works_for_me_count || 0
      }));
    } catch (error) {
      console.error('Error getting protocols:', error);
      throw error;
    }
  }

  /**
   * Get a single protocol by ID
   * @param {string} id - Protocol ID
   * @returns {Promise<Object|null>} Protocol object or null if not found
   */
  async getProtocolById(id) {
    try {
      const result = await this.pool.query('SELECT * FROM protocols WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      
      // Transform the database row to match the expected format
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        author: row.author,
        dateCreated: row.date_created,
        datePublished: row.date_published,
        publishTime: row.publish_time,
        status: row.status,
        imageUrl: row.image_url,
        keyFeatures: row.key_features || [],
        steps: row.steps || [],
        materials: row.materials || [],
        equipment: row.equipment || [],
        visibility: row.visibility,
        rating: parseFloat(row.rating) || 0,
        efficiency: parseFloat(row.efficiency) || 0,
        consistency: parseFloat(row.consistency) || 0,
        accuracy: parseFloat(row.accuracy) || 0,
        safety: parseFloat(row.safety) || 0,
        easeOfExecution: parseFloat(row.ease_of_execution) || 0,
        scalability: parseFloat(row.scalability) || 0,
        worksForMeCount: row.works_for_me_count || 0
      };
    } catch (error) {
      console.error(`Error getting protocol with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new protocol
   * @param {Object} protocol - Protocol data
   * @returns {Promise<Object>} Created protocol
   */
  async createProtocol(protocol) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const { title, description, category, subcategory, author, content, tags } = protocol;
      
      const result = await client.query(
        `INSERT INTO protocols 
         (title, description, category, subcategory, author, content, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [title, description, category, subcategory, author, JSON.stringify(content), tags || []]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating protocol:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing protocol
   * @param {string} id - Protocol ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated protocol or null if not found
   */
  async updateProtocol(id, updates) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Build the SET clause dynamically based on provided updates
      const setValues = [];
      const queryParams = [id];
      let paramIndex = 2;
      
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'content') {
          setValues.push(`${key} = $${paramIndex}::jsonb`);
          queryParams.push(JSON.stringify(value));
        } else if (key === 'tags') {
          setValues.push(`${key} = $${paramIndex}::text[]`);
          queryParams.push(value || []);
        } else {
          setValues.push(`${key} = $${paramIndex}`);
          queryParams.push(value);
        }
        paramIndex++;
      }
      
      // Add last_updated timestamp
      setValues.push(`last_updated = CURRENT_TIMESTAMP`);
      
      if (setValues.length === 0) {
        return await this.getProtocolById(id);
      }
      
      const query = `
        UPDATE protocols 
        SET ${setValues.join(', ')} 
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await client.query(query, queryParams);
      
      await client.query('COMMIT');
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error updating protocol with ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a protocol
   * @param {string} id - Protocol ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteProtocol(id) {
    try {
      const result = await this.pool.query('DELETE FROM protocols WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting protocol with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get reviews for a protocol
   * @param {string} protocolId - Protocol ID
   * @returns {Promise<Array>} Array of review objects
   */
  async getReviews(protocolId) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM reviews WHERE protocol_id = $1 ORDER BY date_created DESC',
        [protocolId]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error getting reviews for protocol with ID ${protocolId}:`, error);
      throw error;
    }
  }

  /**
   * Add a review to a protocol
   * @param {string} protocolId - Protocol ID
   * @param {Object} review - Review data
   * @returns {Promise<Object>} Created review
   */
  async addReview(protocolId, review) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert the review
      const { user_id, rating, comment, works_for_me } = review;
      
      const reviewResult = await client.query(
        `INSERT INTO reviews 
         (protocol_id, user_id, rating, comment, works_for_me) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [protocolId, user_id, rating, comment, works_for_me || false]
      );
      
      // Update the protocol's average rating and review count
      await client.query(
        `UPDATE protocols 
         SET rating = (
           SELECT AVG(rating) FROM reviews WHERE protocol_id = $1
         ),
         review_count = (
           SELECT COUNT(*) FROM reviews WHERE protocol_id = $1
         )
         WHERE id = $1`,
        [protocolId]
      );
      
      await client.query('COMMIT');
      return reviewResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error adding review to protocol with ID ${protocolId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get bookmarked protocols for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of protocol objects
   */
  async getBookmarkedProtocols(userId) {
    try {
      const result = await this.pool.query(
        `SELECT p.* 
         FROM protocols p
         JOIN bookmarks b ON p.id = b.protocol_id
         WHERE b.user_id = $1
         ORDER BY b.date_created DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error getting bookmarked protocols for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add a bookmark
   * @param {string} userId - User ID
   * @param {string} protocolId - Protocol ID
   * @returns {Promise<Object>} Created bookmark
   */
  async addBookmark(userId, protocolId) {
    try {
      const result = await this.pool.query(
        `INSERT INTO bookmarks (user_id, protocol_id)
         VALUES ($1, $2)
         ON CONFLICT (protocol_id, user_id) DO NOTHING
         RETURNING *`,
        [userId, protocolId]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Error adding bookmark for user ${userId} on protocol ${protocolId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a bookmark
   * @param {string} userId - User ID
   * @param {string} protocolId - Protocol ID
   * @returns {Promise<boolean>} True if removed successfully
   */
  async removeBookmark(userId, protocolId) {
    try {
      const result = await this.pool.query(
        'DELETE FROM bookmarks WHERE user_id = $1 AND protocol_id = $2 RETURNING id',
        [userId, protocolId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error removing bookmark for user ${userId} on protocol ${protocolId}:`, error);
      throw error;
    }
  }

  /**
   * Get protocols marked as "Works for Me" by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of protocol objects
   */
  async getWorksForMeProtocols(userId) {
    try {
      const result = await this.pool.query(
        `SELECT p.* 
         FROM protocols p
         JOIN reviews r ON p.id = r.protocol_id
         WHERE r.user_id = $1 AND r.works_for_me = true
         ORDER BY r.date_created DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error getting "Works for Me" protocols for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a review
   * @param {number} reviewId - Review ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteReview(reviewId) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get the protocol ID before deleting the review
      const protocolResult = await client.query(
        'SELECT protocol_id FROM reviews WHERE id = $1',
        [reviewId]
      );
      
      if (protocolResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }
      
      const protocolId = protocolResult.rows[0].protocol_id;
      
      // Delete the review
      const deleteResult = await client.query(
        'DELETE FROM reviews WHERE id = $1 RETURNING id',
        [reviewId]
      );
      
      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }
      
      // Update the protocol's average rating and review count
      await client.query(
        `UPDATE protocols 
         SET rating = (
           SELECT AVG(rating) FROM reviews WHERE protocol_id = $1
         ),
         review_count = (
           SELECT COUNT(*) FROM reviews WHERE protocol_id = $1
         ),
         works_for_me_count = (
           SELECT COUNT(*) FROM reviews WHERE protocol_id = $1 AND works_for_me = true
         )
         WHERE id = $1`,
        [protocolId]
      );
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error deleting review with ID ${reviewId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('PostgreSQL connection pool has been closed');
    }
  }
}

module.exports = PostgreSQLDatabaseAdapter; 