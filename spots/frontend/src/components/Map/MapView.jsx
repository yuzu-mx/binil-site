import { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getPlaces } from '../../api/client';
import PinDetail from './PinDetail';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 }; // CDMX
const DEFAULT_ZOOM = 12;

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8888a0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a45' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);

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
          {places.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => setSelectedPlace(place)}
            >
              <div className="text-2xl cursor-pointer hover:scale-125 transition-transform drop-shadow-lg">
                {place.emoji || '📍'}
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-spots-bg/60 pointer-events-none">
          <div className="text-2xl animate-pulse-dot">📍</div>
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
