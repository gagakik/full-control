const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  PORT: PORT
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Start server
const initializeAndTestDB = async () => {
  try {
    // Initialize database tables
    await db.initializeDatabase();

    // Test connection
    console.log('Testing database connection...');
    await db.query('SELECT NOW()');
    console.log('Database connection test successful');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
};

app.listen(PORT, '0.0.0.0', () => {
  console.log(`სერვერი გაშვებულია პორტზე ${PORT}`);
  initializeAndTestDB();
});




