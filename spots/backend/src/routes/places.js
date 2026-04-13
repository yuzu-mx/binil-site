import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /api/places - List user's places
router.get('/', async (req, res) => {
  try {
    const { list_id, category, city } = req.query;
    let query = `
      SELECT p.id, p.name, p.address, p.city, p.country,
             ST_Y(p.location::geometry) as lat,
             ST_X(p.location::geometry) as lng,
             p.source_url, p.source_type, p.source_title, p.source_author,
             p.thumbnail_url, p.notes, p.rating, p.visited,
             p.created_at, p.list_id,
             c.slug as category, c.emoji, c.name as category_name
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (list_id) {
      query += ` AND p.list_id = $${paramIndex++}`;
      params.push(list_id);
    }
    if (category) {
      query += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }
    if (city) {
      query += ` AND p.city ILIKE $${paramIndex++}`;
      params.push(`%${city}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json({ places: rows });
  } catch (err) {
    console.error('GET /places error:', err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// GET /api/places/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, ST_Y(p.location::geometry) as lat, ST_X(p.location::geometry) as lng,
              c.slug as category, c.emoji, c.name as category_name
       FROM places p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    res.json({ place: rows[0] });
  } catch (err) {
    console.error('GET /places/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch place' });
  }
});

// POST /api/places - Create a place
router.post('/', async (req, res) => {
  try {
    const {
      name, category, lat, lng, address, city, country,
      source_url, source_type, source_title, source_author,
      thumbnail_url, notes, list_id,
    } = req.body;

    if (!name || lat == null || lng == null) {
      return res.status(400).json({ error: 'name, lat, and lng are required' });
    }

    // Look up category ID
    let categoryId = null;
    if (category) {
      const catResult = await pool.query(
        'SELECT id FROM categories WHERE slug = $1',
        [category]
      );
      categoryId = catResult.rows[0]?.id || null;
    }

    const { rows } = await pool.query(
      `INSERT INTO places (
        user_id, category_id, name, address, city, country,
        location, source_url, source_type, source_title,
        source_author, thumbnail_url, notes, list_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
        $9, $10, $11, $12, $13, $14, $15
      ) RETURNING id`,
      [
        req.user.id, categoryId, name, address || null, city || null, country || null,
        lng, lat,
        source_url || null, source_type || null, source_title || null,
        source_author || null, thumbnail_url || null, notes || null, list_id || null,
      ]
    );

    res.status(201).json({ id: rows[0].id, message: 'Place created' });
  } catch (err) {
    console.error('POST /places error:', err);
    res.status(500).json({ error: 'Failed to create place' });
  }
});

// PATCH /api/places/:id - Update a place
router.patch('/:id', async (req, res) => {
  try {
    const allowedFields = [
      'name', 'address', 'city', 'country', 'notes',
      'rating', 'visited', 'list_id', 'source_url',
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(req.body[field]);
      }
    }

    // Handle category change
    if (req.body.category) {
      const catResult = await pool.query(
        'SELECT id FROM categories WHERE slug = $1',
        [req.body.category]
      );
      if (catResult.rows[0]) {
        updates.push(`category_id = $${paramIndex++}`);
        values.push(catResult.rows[0].id);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id, req.user.id);

    const query = `
      UPDATE places SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING id
    `;

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json({ message: 'Place updated' });
  } catch (err) {
    console.error('PATCH /places/:id error:', err);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

// DELETE /api/places/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM places WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    res.json({ message: 'Place deleted' });
  } catch (err) {
    console.error('DELETE /places/:id error:', err);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

export default router;
