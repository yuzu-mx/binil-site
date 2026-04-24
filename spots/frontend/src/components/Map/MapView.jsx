import { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getPlaces } from '../../api/client';
import PinDetail from './PinDetail';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 }; // CDMX
const DEFAULT_ZOOM = 13;

// Dark map style matching Yaay's aesthetic
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b8a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a45' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5a5a7a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const CATEGORY_FILTERS = [
  { slug: 'all', emoji: '📍', label: 'Todos' },
  { slug: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { slug: 'bar', emoji: '🍺', label: 'Bar' },
  { slug: 'cafe', emoji: '☕', label: 'Cafe' },
  { slug: 'beach', emoji: '🏖️', label: 'Playa' },
  { slug: 'club', emoji: '🎶', label: 'Club' },
  { slug: 'hotel', emoji: '🏨', label: 'Hotel' },
  { slug: 'park', emoji: '🌳', label: 'Parque' },
  { slug: 'shop', emoji: '🛍️', label: 'Tienda' },
];

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchPlaces = useCallback(async () => {
    try {
      const data = await getPlaces();
      setPlaces(data.places || []);
    } catch (err) {
      console.error('Failed to fetch places:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const filteredPlaces = activeFilter === 'all'
    ? places
    : places.filter((p) => p.category === activeFilter);

  // Count per category
  const categoryCounts = places.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="h-full w-full relative">
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          mapId="spots-main-map"
          styles={MAP_STYLES}
          className="h-full w-full"
        >
          {filteredPlaces.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => setSelectedPlace(place)}
            >
              <div className="relative cursor-pointer hover:scale-110 transition-transform">
                {/* Circular emoji marker like Yaay */}
                <div className="w-10 h-10 rounded-full bg-spots-cream border-2 border-spots-mint flex items-center justify-center shadow-lg">
                  <span className="text-lg">{place.emoji || '📍'}</span>
                </div>
                {/* Place name tooltip */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded">
                    {place.name}
                  </span>
                </div>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Search bar overlay */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="bg-spots-cream/95 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg border border-spots-border">
          <svg className="w-5 h-5 text-spots-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <span className="text-spots-muted text-sm flex-1">Buscar lugares, boards...</span>
        </div>
      </div>

      {/* Category filter chips - horizontal scroll like Yaay */}
      <div className="absolute top-[68px] left-0 right-0 z-10 px-3">
        <div className="flex gap-2 overflow-x-auto filter-chips pb-1">
          {CATEGORY_FILTERS.map((cat) => {
            const count = cat.slug === 'all' ? places.length : (categoryCounts[cat.slug] || 0);
            if (cat.slug !== 'all' && count === 0) return null;
            const isActive = activeFilter === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveFilter(cat.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-spots-mint text-spots-dark shadow-md'
                    : 'bg-spots-cream/90 backdrop-blur-sm text-spots-dark border border-spots-border'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className={`text-xs ${isActive ? 'text-spots-dark/70' : 'text-spots-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-spots-cream/40 pointer-events-none z-20">
          <div className="bg-spots-cream rounded-2xl p-4 shadow-lg">
            <div className="text-3xl animate-pulse-dot">📍</div>
          </div>
        </div>
      )}

      {/* Selected place bottom sheet */}
      {selectedPlace && (
        <PinDetail
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onUpdate={fetchPlaces}
        />
      )}
    </div>
  );
}
