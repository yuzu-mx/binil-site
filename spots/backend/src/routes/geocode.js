import { Router } from 'express';
import { geocode } from '../services/geocode.js';

const router = Router();

// GET /api/geocode?q=search+query
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ error: 'q parameter is required' });
    }

    const results = await geocode(q.trim());
    res.json({ results });
  } catch (err) {
    console.error('GET /geocode error:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

export default router;
