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


// Token verification middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token არ არის მოწოდებული' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'არასწორი token' });
    }
    req.user = user;
    next();
  });
};


// Authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'არ გაქვთ ამ მოქმედების ნებართვა' });
    }
    next();
  };
};


// User management routes
app.get('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        username, 
        role,
        COALESCE(created_at, CURRENT_TIMESTAMP) as created_at
      FROM users 
      ORDER BY COALESCE(created_at, CURRENT_TIMESTAMP) DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('მომხმარებლების მიღების შეცდომა:', error);
    res.status(500).json({ message: 'მომხმარებლების მიღება ვერ მოხერხდა' });
  }
});

app.put('/api/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role } = req.body;

    const result = await db.query(
      'UPDATE users SET username = $1, role = $2 WHERE id = $3 RETURNING id, username, role, created_at',
      [username, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('მომხმარებლის განახლების შეცდომა:', error);
    res.status(500).json({ message: 'მომხმარებლის განახლება ვერ მოხერხდა' });
  }
});

app.delete('/api/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'საკუთარი თავის წაშლა შეუძლებელია' });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
    }

    res.json({ message: 'მომხმარებელი წარმატებით წაიშალა' });
  } catch (error) {
    console.error('მომხმარებლის წაშლის შეცდომა:', error);
    res.status(500).json({ message: 'მომხმარებლის წაშლა ვერ მოხერხდა' });
  }
});



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




