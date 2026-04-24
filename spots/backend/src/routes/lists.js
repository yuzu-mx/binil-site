import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /api/lists
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, COUNT(p.id)::int as place_count
       FROM lists l
       LEFT JOIN places p ON p.list_id = l.id
       WHERE l.user_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json({ lists: rows });
  } catch (err) {
    console.error('GET /lists error:', err);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// POST /api/lists
router.post('/', async (req, res) => {
  try {
    const { name, emoji, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO lists (user_id, name, emoji, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [req.user.id, name.trim(), emoji || '📋', description || null]
    );

    res.status(201).json({ id: rows[0].id, message: 'List created' });
  } catch (err) {
    console.error('POST /lists error:', err);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// PATCH /api/lists/:id
router.patch('/:id', async (req, res) => {
  try {
    const { name, emoji, description } = req.body;
    const updates = [];
    const values = [];
    let i = 1;

    if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
    if (emoji !== undefined) { updates.push(`emoji = $${i++}`); values.push(emoji); }
    if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id, req.user.id);

    const { rows } = await pool.query(
      `UPDATE lists SET ${updates.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING id`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ message: 'List updated' });
  } catch (err) {
    console.error('PATCH /lists/:id error:', err);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// DELETE /api/lists/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM lists WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json({ message: 'List deleted' });
  } catch (err) {
    console.error('DELETE /lists/:id error:', err);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

export default router;
