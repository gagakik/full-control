
const express = require('express');
const router = express.Router();
const db = require('../db');

// Authentication middleware (imported from main server)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token არ არის მოწოდებული' });
  }

  const jwt = require('jsonwebtoken');
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

// ===================== EXHIBITION SPACES API =====================

// Get all exhibition spaces
router.get('/exhibition', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        building_name, 
        description, 
        area_sqm, 
        ceiling_height,
        created_by_user_id,
        updated_by_user_id,
        created_at, 
        updated_at 
      FROM spaces_exhebition 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('გამოფენის სივრცეების მიღების შეცდომა:', error);
    res.status(500).json({ message: 'გამოფენის სივრცეების მიღება ვერ მოხერხდა' });
  }
});

// Get single exhibition space
router.get('/exhibition/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM spaces_exhebition WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'გამოფენის სივრცე ვერ მოიძებნა' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('გამოფენის სივრცის მიღების შეცდომა:', error);
    res.status(500).json({ message: 'გამოფენის სივრცის მიღება ვერ მოხერხდა' });
  }
});

// Create new exhibition space
router.post('/exhibition', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { building_name, description, area_sqm, ceiling_height } = req.body;
    
    if (!building_name) {
      return res.status(400).json({ message: 'შენობის სახელი სავალდებულოა' });
    }

    const result = await db.query(`
      INSERT INTO spaces_exhebition (building_name, description, area_sqm, ceiling_height, created_by_user_id, updated_by_user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [building_name, description || null, area_sqm || 0, ceiling_height || 0, req.user.id, req.user.id]);

    res.status(201).json({
      message: 'გამოფენის სივრცე წარმატებით შეიქმნა',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('გამოფენის სივრცის შექმნის შეცდომა:', error);
    res.status(500).json({ message: 'გამოფენის სივრცის შექმნა ვერ მოხერხდა' });
  }
});

// Update exhibition space
router.put('/exhibition/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { building_name, description, area_sqm, ceiling_height } = req.body;

    const result = await db.query(`
      UPDATE spaces_exhebition 
      SET building_name = $1, description = $2, area_sqm = $3, ceiling_height = $4, updated_by_user_id = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [building_name, description, area_sqm, ceiling_height, req.user.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'გამოფენის სივრცე ვერ მოიძებნა' });
    }

    res.json({
      message: 'გამოფენის სივრცე წარმატებით განახლდა',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('გამოფენის სივრცის განახლების შეცდომა:', error);
    res.status(500).json({ message: 'გამოფენის სივრცის განახლება ვერ მოხერხდა' });
  }
});

// Delete exhibition space
router.delete('/exhibition/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM spaces_exhebition WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'გამოფენის სივრცე ვერ მოიძებნა' });
    }

    res.json({ message: 'გამოფენის სივრცე წარმატებით წაიშალა' });
  } catch (error) {
    console.error('გამოფენის სივრცის წაშლის შეცდომა:', error);
    res.status(500).json({ message: 'გამოფენის სივრცის წაშლა ვერ მოხერხდა' });
  }
});

// ===================== PARKING SPACES API =====================

// Get all parking spaces
router.get('/parking', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        building_name, 
        description, 
        number_of_seats,
        created_by_user_id,
        updated_by_user_id,
        created_at, 
        updated_at 
      FROM spaces_parking 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('პარკინგის სივრცეების მიღების შეცდომა:', error);
    res.status(500).json({ message: 'პარკინგის სივრცეების მიღება ვერ მოხერხდა' });
  }
});

// Get single parking space
router.get('/parking/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM spaces_parking WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'პარკინგის სივრცე ვერ მოიძებნა' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('პარკინგის სივრცის მიღების შეცდომა:', error);
    res.status(500).json({ message: 'პარკინგის სივრცის მიღება ვერ მოხერხდა' });
  }
});

// Create new parking space
router.post('/parking', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { building_name, description, number_of_seats } = req.body;
    
    if (!building_name) {
      return res.status(400).json({ message: 'შენობის სახელი სავალდებულოა' });
    }

    const result = await db.query(`
      INSERT INTO spaces_parking (building_name, description, number_of_seats, created_by_user_id, updated_by_user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [building_name, description || null, number_of_seats || 0, req.user.id, req.user.id]);

    res.status(201).json({
      message: 'პარკინგის სივრცე წარმატებით შეიქმნა',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('პარკინგის სივრცის შექმნის შეცდომა:', error);
    res.status(500).json({ message: 'პარკინგის სივრცის შექმნა ვერ მოხერხდა' });
  }
});

// Update parking space
router.put('/parking/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { building_name, description, number_of_seats } = req.body;

    const result = await db.query(`
      UPDATE spaces_parking 
      SET building_name = $1, description = $2, number_of_seats = $3, updated_by_user_id = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [building_name, description, number_of_seats, req.user.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'პარკინგის სივრცე ვერ მოიძებნა' });
    }

    res.json({
      message: 'პარკინგის სივრცე წარმატებით განახლდა',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('პარკინგის სივრცის განახლების შეცდომა:', error);
    res.status(500).json({ message: 'პარკინგის სივრცის განახლება ვერ მოხერხდა' });
  }
});

// Delete parking space
router.delete('/parking/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM spaces_parking WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'პარკინგის სივრცე ვერ მოიძებნა' });
    }

    res.json({ message: 'პარკინგის სივრცე წარმატებით წაიშალა' });
  } catch (error) {
    console.error('პარკინგის სივრცის წაშლის შეცდომა:', error);
    res.status(500).json({ message: 'პარკინგის სივრცის წაშლა ვერ მოხერხდა' });
  }
});

// ===================== RENT SPACES API =====================

// Get all rent spaces
router.get('/rent', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        building_name, 
        spaces_name,
        description, 
        area_sqm,
        electricity_subscriber_number,
        water_subscriber_number,
        gas_subscriber_number,
        created_by_user_id,
        updated_by_user_id,
        created_at, 
        updated_at 
      FROM spaces_rent 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('ქირავნობის სივრცეების მიღების შეცდომა:', error);
    res.status(500).json({ message: 'ქირავნობის სივრცეების მიღება ვერ მოხერხდა' });
  }
});

// Get single rent space
router.get('/rent/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM spaces_rent WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ქირავნობის სივრცე ვერ მოიძებნა' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('ქირავნობის სივრცის მიღების შეცდომა:', error);
    res.status(500).json({ message: 'ქირავნობის სივრცის მიღება ვერ მოხერხდა' });
  }
});

// Create new rent space
router.post('/rent', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { building_name, spaces_name, description, area_sqm, electricity_subscriber_number, water_subscriber_number, gas_subscriber_number } = req.body;
    
    if (!building_name) {
      return res.status(400).json({ message: 'შენობის სახელი სავალდებულოა' });
    }

    const result = await db.query(`
      INSERT INTO spaces_rent (building_name, spaces_name, description, area_sqm, electricity_subscriber_number, water_subscriber_number, gas_subscriber_number, created_by_user_id, updated_by_user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [building_name, spaces_name || null, description || null, area_sqm || 0, electricity_subscriber_number || 0, water_subscriber_number || 0, gas_subscriber_number || 0, req.user.id, req.user.id]);

    res.status(201).json({
      message: 'ქირავნობის სივრცე წარმატებით შეიქმნა',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('ქირავნობის სივრცის შექმნის შეცდომა:', error);
    res.status(500).json({ message: 'ქირავნობის სივრცის შექმნა ვერ მოხერხდა' });
  }
});

// Update rent space
router.put('/rent/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { building_name, spaces_name, description, area_sqm, electricity_subscriber_number, water_subscriber_number, gas_subscriber_number } = req.body;

    const result = await db.query(`
      UPDATE spaces_rent 
      SET building_name = $1, spaces_name = $2, description = $3, area_sqm = $4, electricity_subscriber_number = $5, water_subscriber_number = $6, gas_subscriber_number = $7, updated_by_user_id = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [building_name, spaces_name, description, area_sqm, electricity_subscriber_number, water_subscriber_number, gas_subscriber_number, req.user.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ქირავნობის სივრცე ვერ მოიძებნა' });
    }

    res.json({
      message: 'ქირავნობის სივრცე წარმატებით განახლდა',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('ქირავნობის სივრცის განახლების შეცდომა:', error);
    res.status(500).json({ message: 'ქირავნობის სივრცის განახლება ვერ მოხერხდა' });
  }
});

// Delete rent space
router.delete('/rent/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM spaces_rent WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ქირავნობის სივრცე ვერ მოიძებნა' });
    }

    res.json({ message: 'ქირავნობის სივრცე წარმატებით წაიშალა' });
  } catch (error) {
    console.error('ქირავნობის სივრცის წაშლის შეცდომა:', error);
    res.status(500).json({ message: 'ქირავნობის სივრცის წაშლა ვერ მოხერხდა' });
  }
});

// ===================== SUMMARY STATISTICS API =====================

// Get spaces statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const [exhibition, parking, rent] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM spaces_exhebition'),
      db.query('SELECT COUNT(*) as count FROM spaces_parking'),
      db.query('SELECT COUNT(*) as count FROM spaces_rent')
    ]);

    const stats = {
      exhibition: parseInt(exhibition.rows[0].count),
      parking: parseInt(parking.rows[0].count),
      rent: parseInt(rent.rows[0].count),
      total: parseInt(exhibition.rows[0].count) + parseInt(parking.rows[0].count) + parseInt(rent.rows[0].count)
    };

    res.json(stats);
  } catch (error) {
    console.error('სტატისტიკის მიღების შეცდომა:', error);
    res.status(500).json({ message: 'სტატისტიკის მიღება ვერ მოხერხდა' });
  }
});

module.exports = router;
