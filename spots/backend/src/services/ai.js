/**
 * AI-powered location extraction using Claude API
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORY_LIST = [
  'restaurant', 'bar', 'cafe', 'beach', 'club',
  'hotel', 'park', 'museum', 'shop', 'viewpoint', 'other',
];

const CATEGORY_EMOJIS = {
  restaurant: '🍽️', bar: '🍺', cafe: '☕', beach: '🏖️',
  club: '🎶', hotel: '🏨', park: '🌳', museum: '🏛️',
  shop: '🛍️', viewpoint: '🌄', other: '📍',
};

/**
 * Extract place information from social media metadata using Claude
 */
export async function extractPlaceFromMetadata({ title, author, hint }) {
  const prompt = `You are an assistant that identifies real-world places from social media post metadata.

Given the following information from a social media post, identify the specific place (restaurant, bar, beach, hotel, etc.) being featured.

Post title/caption: "${title || 'No title available'}"
Post author: "${author || 'Unknown'}"
User hint: "${hint || 'No hint provided'}"

Respond ONLY with a JSON object (no markdown, no explanation) with these fields:
- name: The name of the place (string, or null if you can't identify it)
- category: One of: ${CATEGORY_LIST.join(', ')}
- city: The city where this place is located (string, or null)
- country: The country (string, or null)
- confidence: "high", "medium", or "low"
- search_query: A search query that would help find this place on Google Maps (combine name + city)

If you cannot identify any place at all, return: {"name": null, "category": "other", "city": null, "country": null, "confidence": "low", "search_query": null}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0]?.text?.trim();

  try {
    const parsed = JSON.parse(text);
    return {
      name: parsed.name,
      category: CATEGORY_LIST.includes(parsed.category) ? parsed.category : 'other',
      emoji: CATEGORY_EMOJIS[parsed.category] || '📍',
      city: parsed.city,
      country: parsed.country,
      confidence: parsed.confidence || 'low',
      search_query: parsed.search_query,
    };
  } catch {
    console.error('Failed to parse AI response:', text);
    return null;
  }
}
