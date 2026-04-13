import admin from 'firebase-admin';
import pool from '../db/pool.js';

// Initialize Firebase Admin with project ID only (no service account needed for token verification)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Upsert user in our database
    const { rows } = await pool.query(
      `INSERT INTO users (firebase_uid, email, display_name, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (firebase_uid) DO UPDATE SET
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         avatar_url = EXCLUDED.avatar_url,
         updated_at = NOW()
       RETURNING id, email, display_name`,
      [decoded.uid, decoded.email, decoded.name || null, decoded.picture || null]
    );

    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
