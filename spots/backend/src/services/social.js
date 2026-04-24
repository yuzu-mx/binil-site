/**
 * Social media URL processing via oEmbed APIs
 */

const TIKTOK_OEMBED = 'https://www.tiktok.com/oembed';
const INSTAGRAM_OEMBED = 'https://graph.facebook.com/v18.0/instagram_oembed';

/**
 * Detect the source type from a URL
 */
export function detectSourceType(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('instagram.com') || host.includes('instagr.am')) {
      return 'instagram';
    }
    if (host.includes('tiktok.com') || host.includes('vm.tiktok.com')) {
      return 'tiktok';
    }
    if (host.includes('google.com/maps') || host.includes('maps.google') || host.includes('goo.gl/maps')) {
      return 'google_maps';
    }
    return 'other';
  } catch {
    return 'other';
  }
}

/**
 * Fetch TikTok oEmbed data (public, no auth required)
 */
async function fetchTikTokOEmbed(url) {
  const res = await fetch(`${TIKTOK_OEMBED}?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`TikTok oEmbed failed: ${res.status}`);
  const data = await res.json();
  return {
    title: data.title || '',
    author: data.author_name || '',
    thumbnail: data.thumbnail_url || null,
  };
}

/**
 * Fetch Instagram oEmbed data (requires Facebook App Token)
 */
async function fetchInstagramOEmbed(url) {
  const token = process.env.INSTAGRAM_APP_TOKEN;
  if (!token) {
    throw new Error('Instagram App Token not configured');
  }

  const res = await fetch(
    `${INSTAGRAM_OEMBED}?url=${encodeURIComponent(url)}&access_token=${token}`
  );
  if (!res.ok) throw new Error(`Instagram oEmbed failed: ${res.status}`);
  const data = await res.json();
  return {
    title: data.title || '',
    author: data.author_name || '',
    thumbnail: data.thumbnail_url || null,
  };
}

/**
 * Parse coordinates from Google Maps URL
 */
function parseGoogleMapsUrl(url) {
  // Pattern: /@lat,lng,zoom
  const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2]),
    };
  }

  // Pattern: ?q=lat,lng
  const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (queryMatch) {
    return {
      lat: parseFloat(queryMatch[1]),
      lng: parseFloat(queryMatch[2]),
    };
  }

  // Pattern: place name in URL
  const placeMatch = url.match(/\/place\/([^/@]+)/);
  if (placeMatch) {
    return { placeName: decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ') };
  }

  return null;
}

/**
 * Fetch metadata from a social media URL
 */
export async function fetchUrlMetadata(url) {
  const sourceType = detectSourceType(url);

  switch (sourceType) {
    case 'tiktok':
      return { source: 'tiktok', ...(await fetchTikTokOEmbed(url)) };

    case 'instagram':
      return { source: 'instagram', ...(await fetchInstagramOEmbed(url)) };

    case 'google_maps': {
      const parsed = parseGoogleMapsUrl(url);
      return { source: 'google_maps', ...parsed, title: parsed?.placeName || '', author: '', thumbnail: null };
    }

    default:
      return { source: 'other', title: '', author: '', thumbnail: null };
  }
}
