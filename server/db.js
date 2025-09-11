const { Pool } = require("pg");
require("dotenv").config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
});

pool.on("connect", () => {
  console.log("PostgreSQL ბაზასთან კავშირი დამყარდა");
});

pool.on("error", (err) => {
  console.error("PostgreSQL კავშირის შეცდომა:", err);
});

const initializeDatabase = async () => {
  // SQL to create tables
  const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Add role column if it doesn't exist
  const addRoleColumnQuery = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';
  `;
  try {
    await pool.query(userTableQuery);
    await pool.query(addRoleColumnQuery);
    console.log('User table created successfully or already exists.');

    // Create default admin user if no users exist
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    if (existingUsers.rows[0].count === '0') {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin', 12);
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('Default admin user created (username: admin, password: admin)');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

const query = (text, params) => pool.query(text, params);

// Here is the fix: You need to export the functions
module.exports = {
  initializeDatabase,
  query,
};