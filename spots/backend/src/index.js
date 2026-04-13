import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import placesRouter from './routes/places.js';
import listsRouter from './routes/lists.js';
import importRouter from './routes/import.js';
import geocodeRouter from './routes/geocode.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'spots-api' });
});

// All API routes require authentication
app.use('/api', authMiddleware);

app.use('/api/places', placesRouter);
app.use('/api/lists', listsRouter);
app.use('/api/import', importRouter);
app.use('/api/geocode', geocodeRouter);

app.listen(PORT, () => {
  console.log(`Spots API running on port ${PORT}`);
});
