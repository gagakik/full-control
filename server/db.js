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
      role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'sales', 'marketing', 'operator', 'operation', 'finance', 'hr', 'support')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

      CREATE TABLE IF NOT EXISTS spaces_exhebition (
        id SERIAL PRIMARY KEY,
        building_name VARCHAR(255) NOT NULL,
        description TEXT,
        area_sqm DECIMAL(10,2) DEFAULT 0,
		    ceiling_height DECIMAL(10,2) DEFAULT 0,
        created_by_user_id INTEGER,
        updated_by_user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

	    CREATE TABLE IF NOT EXISTS spaces_parking (
        id SERIAL PRIMARY KEY,
        building_name VARCHAR(255) NOT NULL,
        description TEXT,
        number_of_seats DECIMAL(10,2) DEFAULT 0,
        created_by_user_id INTEGER,
        updated_by_user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

	  	CREATE TABLE IF NOT EXISTS spaces_rent (
        id SERIAL PRIMARY KEY,
        building_name VARCHAR(255) NOT NULL,
		    spaces_name VARCHAR(255),
        description TEXT,
        area_sqm DECIMAL(10,2) DEFAULT 0,
		    electricity_subscriber_number DECIMAL DEFAULT 0,
		    water_subscriber_number DECIMAL DEFAULT 0,
		    gas_subscriber_number DECIMAL DEFAULT 0,
        created_by_user_id INTEGER,
        updated_by_user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
  `;
};

const query = (text, params) => pool.query(text, params);

// Here is the fix: You need to export the functions
module.exports = {
  initializeDatabase,
  query,
};