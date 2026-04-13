import { Router } from 'express';
import { fetchUrlMetadata, detectSourceType } from '../services/social.js';
import { extractPlaceFromMetadata } from '../services/ai.js';
import { findPlace } from '../services/geocode.js';

const router = Router();

/**
 * POST /api/import/url
 * Process a social media URL to extract place information
 *
 * Pipeline:
 * 1. Detect URL type (instagram/tiktok/google_maps)
 * 2. Fetch metadata via oEmbed
 * 3. Send metadata to Claude AI to identify the place
 * 4. Geocode the identified place with Google Places API
 * 5. Return structured result for user confirmation
 */
router.post('/url', async (req, res) => {
  try {
    const { url, hint } = req.body;

    if (!url?.trim()) {
      return res.status(400).json({ error: 'url is required' });
    }

    // Step 1 & 2: Detect type and fetch metadata
    const metadata = await fetchUrlMetadata(url.trim());

    // If Google Maps URL with coordinates, skip AI
    if (metadata.source === 'google_maps' && metadata.lat && metadata.lng) {
      return res.json({
        source: 'google_maps',
        title: metadata.title,
        thumbnail: null,
        author: null,
        place: {
          name: metadata.title || 'Lugar desde Google Maps',
          category: 'other',
          emoji: '📍',
          lat: metadata.lat,
          lng: metadata.lng,
          address: null,
          city: null,
          country: null,
          confidence: 'high',
        },
      });
    }

    // If Google Maps URL with place name, geocode directly
    if (metadata.source === 'google_maps' && metadata.placeName) {
      const geoResult = await findPlace(metadata.placeName);
      if (geoResult) {
        return res.json({
          source: 'google_maps',
          title: metadata.placeName,
          thumbnail: null,
          author: null,
          place: {
            name: geoResult.name || metadata.placeName,
            category: 'other',
            emoji: '📍',
            lat: geoResult.lat,
            lng: geoResult.lng,
            address: geoResult.address,
            city: geoResult.city,
            country: geoResult.country,
            confidence: 'high',
          },
        });
      }
    }

    // Step 3: AI extraction
    const aiResult = await extractPlaceFromMetadata({
      title: metadata.title,
      author: metadata.author,
      hint,
    });

    if (!aiResult?.name) {
      return res.json({
        source: metadata.source,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        author: metadata.author,
        place: null,
        message: 'No se pudo identificar el lugar. Intenta agregar una pista o usar el modo manual.',
      });
    }

    // Step 4: Geocode the AI result
    const searchQuery = aiResult.search_query || `${aiResult.name} ${aiResult.city || ''}`.trim();
    const geoResult = await findPlace(searchQuery);

    if (!geoResult) {
      return res.json({
        source: metadata.source,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        author: metadata.author,
        place: {
          name: aiResult.name,
          category: aiResult.category,
          emoji: aiResult.emoji,
          lat: null,
          lng: null,
          address: null,
          city: aiResult.city,
          country: aiResult.country,
          confidence: 'low',
        },
        message: 'Se identifico el lugar pero no se pudo encontrar en el mapa. Verifica la ubicacion manualmente.',
      });
    }

    // Step 5: Return combined result
    res.json({
      source: metadata.source,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      author: metadata.author,
      place: {
        name: geoResult.name || aiResult.name,
        category: aiResult.category,
        emoji: aiResult.emoji,
        lat: geoResult.lat,
        lng: geoResult.lng,
        address: geoResult.address,
        city: geoResult.city || aiResult.city,
        country: geoResult.country || aiResult.country,
        confidence: aiResult.confidence,
      },
    });
  } catch (err) {
    console.error('POST /import/url error:', err);
    res.status(500).json({
      error: 'Error procesando la URL',
      details: err.message,
    });
  }
});

export default router;
