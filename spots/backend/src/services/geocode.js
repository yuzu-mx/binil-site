/**
 * Google Places / Geocoding service
 */

const PLACES_API = 'https://maps.googleapis.com/maps/api/place';
const GEOCODE_API = 'https://maps.googleapis.com/maps/api/geocode';

/**
 * Search for a place using Google Places Text Search
 */
export async function findPlace(query) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('Google Maps API key not configured');

  const res = await fetch(
    `${PLACES_API}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry,formatted_address,name,place_id&key=${key}`
  );

  if (!res.ok) throw new Error(`Google Places API failed: ${res.status}`);
  const data = await res.json();

  if (!data.candidates?.length) return null;

  const place = data.candidates[0];
  const location = place.geometry?.location;

  // Extract city and country from address
  const addressParts = (place.formatted_address || '').split(',').map((p) => p.trim());

  return {
    name: place.name,
    lat: location?.lat,
    lng: location?.lng,
    address: place.formatted_address,
    city: addressParts.length >= 3 ? addressParts[addressParts.length - 3] : null,
    country: addressParts.length >= 1 ? addressParts[addressParts.length - 1] : null,
    place_id: place.place_id,
  };
}

/**
 * Geocode a text query (for the search bar)
 */
export async function geocode(query) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('Google Maps API key not configured');

  const res = await fetch(
    `${PLACES_API}/textsearch/json?query=${encodeURIComponent(query)}&key=${key}`
  );

  if (!res.ok) throw new Error(`Google Places API failed: ${res.status}`);
  const data = await res.json();

  return (data.results || []).slice(0, 5).map((r) => {
    const addressParts = (r.formatted_address || '').split(',').map((p) => p.trim());
    return {
      name: r.name,
      address: r.formatted_address,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
      city: addressParts.length >= 3 ? addressParts[addressParts.length - 3] : null,
      country: addressParts.length >= 1 ? addressParts[addressParts.length - 1] : null,
    };
  });
}
