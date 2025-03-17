/**
 * Script to migrate mock protocols to PostgreSQL
 * 
 * This script will:
 * 1. Connect to PostgreSQL
 * 2. Create the necessary tables if they don't exist
 * 3. Load the mock protocols from the file
 * 4. Insert them into the PostgreSQL database
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { mockProtocols, mockUsers, mockReviews } = require('../utils/mockData');
const { loadGeneratedProtocols } = require('../utils/generateProtocols');

// PostgreSQL connection configuration
const pgConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5433, // Note: Using 5433 as the port since we're using Docker
  database: process.env.POSTGRES_DB || 'vitale',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: process.env.POSTGRES_SSL === 'true'
};

// Create a new pool
const pool = new Pool(pgConfig);

// Function to create tables
async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        job_position VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        department VARCHAR(100),
        profile_image TEXT,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create protocols table with fields matching our mock data
    await client.query(`
      CREATE TABLE IF NOT EXISTS protocols (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        author VARCHAR(100),
        date_created DATE,
        date_published DATE,
        publish_time VARCHAR(50),
        status VARCHAR(50) DEFAULT 'draft',
        image_url TEXT,
        key_features TEXT[],
        steps JSONB,
        materials JSONB,
        equipment JSONB,
        visibility VARCHAR(50) DEFAULT 'public',
        rating NUMERIC(3,2) DEFAULT 0,
        efficiency NUMERIC(3,2) DEFAULT 0,
        consistency NUMERIC(3,2) DEFAULT 0,
        accuracy NUMERIC(3,2) DEFAULT 0,
        safety NUMERIC(3,2) DEFAULT 0,
        ease_of_execution NUMERIC(3,2) DEFAULT 0,
        scalability NUMERIC(3,2) DEFAULT 0,
        works_for_me_count INTEGER DEFAULT 0
      )
    `);

    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        protocol_id VARCHAR(100) REFERENCES protocols(id) ON DELETE CASCADE,
        user_id VARCHAR(100) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        title VARCHAR(255),
        comment TEXT,
        metrics JSONB,
        date_created DATE,
        verified BOOLEAN DEFAULT FALSE,
        works_for_me BOOLEAN DEFAULT FALSE
      )
    `);

    // Create bookmarks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        protocol_id VARCHAR(100) REFERENCES protocols(id) ON DELETE CASCADE,
        user_id VARCHAR(100) NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(protocol_id, user_id)
      )
    `);

    await client.query('COMMIT');
    console.log('Tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to insert users
async function insertUsers() {
  const client = await pool.connect();
  try {
    // Check if users already exist
    const { rows } = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) > 0) {
      console.log(`Skipping user insertion: ${rows[0].count} users already exist`);
      return;
    }

    // Insert users
    for (const user of mockUsers) {
      await client.query(
        `INSERT INTO users (username, email, password, job_position, role, department, profile_image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.username,
          user.email,
          user.password, // Note: In a real app, you'd hash this password
          user.jobPosition,
          user.role,
          user.department,
          user.profileImage
        ]
      );
    }
    console.log(`Inserted ${mockUsers.length} users`);
  } catch (error) {
    console.error('Error inserting users:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to insert protocols
async function insertProtocols() {
  const client = await pool.connect();
  try {
    // Check if protocols already exist
    const { rows } = await client.query('SELECT COUNT(*) FROM protocols');
    if (parseInt(rows[0].count) > 0) {
      console.log(`Skipping protocol insertion: ${rows[0].count} protocols already exist`);
      return parseInt(rows[0].count);
    }

    // Load protocols - first try to load generated protocols, then fall back to mock protocols
    let protocols = loadGeneratedProtocols() || mockProtocols;
    console.log(`Loaded ${protocols.length} protocols for insertion`);

    // Insert protocols
    for (const protocol of protocols) {
      await client.query(
        `INSERT INTO protocols (
          id, name, description, category, author, date_created, date_published, 
          publish_time, status, image_url, key_features, steps, materials, equipment, 
          visibility, rating, efficiency, consistency, accuracy, safety, 
          ease_of_execution, scalability, works_for_me_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
        [
          protocol.id,
          protocol.name,
          protocol.description,
          protocol.category,
          protocol.author,
          protocol.dateCreated,
          protocol.datePublished,
          protocol.publishTime,
          protocol.status || 'published',
          protocol.imageUrl,
          protocol.keyFeatures || [],
          JSON.stringify(protocol.steps || []),
          JSON.stringify(protocol.materials || []),
          JSON.stringify(protocol.equipment || []),
          protocol.visibility || 'public',
          protocol.rating || 0,
          protocol.efficiency || 0,
          protocol.consistency || 0,
          protocol.accuracy || 0,
          protocol.safety || 0,
          protocol.easeOfExecution || 0,
          protocol.scalability || 0,
          protocol.worksForMeCount || 0
        ]
      );
    }
    console.log(`Inserted ${protocols.length} protocols`);
    return protocols.length;
  } catch (error) {
    console.error('Error inserting protocols:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to insert reviews
async function insertReviews() {
  const client = await pool.connect();
  try {
    // Check if reviews already exist
    const { rows } = await client.query('SELECT COUNT(*) FROM reviews');
    if (parseInt(rows[0].count) > 0) {
      console.log(`Skipping review insertion: ${rows[0].count} reviews already exist`);
      return;
    }

    // Insert reviews
    for (const review of mockReviews) {
      await client.query(
        `INSERT INTO reviews (
          protocol_id, user_id, rating, title, comment, metrics, date_created, verified, works_for_me
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          review.protocol,
          review.user,
          review.rating,
          review.title,
          review.comment,
          JSON.stringify(review.metrics || {}),
          review.dateCreated,
          review.verified || false,
          false // works_for_me default
        ]
      );
    }
    console.log(`Inserted ${mockReviews.length} reviews`);
  } catch (error) {
    console.error('Error inserting reviews:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Main function
async function main() {
  try {
    console.log('Starting migration to PostgreSQL...');
    
    // Create tables
    await createTables();
    
    // Insert users
    await insertUsers();
    
    // Insert protocols
    const protocolCount = await insertProtocols();
    
    // Insert reviews
    await insertReviews();
    
    console.log('Migration completed successfully!');
    console.log(`Database now contains ${protocolCount} protocols`);
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 