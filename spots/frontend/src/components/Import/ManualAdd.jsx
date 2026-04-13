import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPlace, geocodeSearch } from '../../api/client';

const CATEGORIES = [
  { slug: 'restaurant', emoji: '🍽️', label: 'Restaurante' },
  { slug: 'bar', emoji: '🍺', label: 'Bar' },
  { slug: 'cafe', emoji: '☕', label: 'Cafe' },
  { slug: 'beach', emoji: '🏖️', label: 'Playa' },
  { slug: 'club', emoji: '🎶', label: 'Club' },
  { slug: 'hotel', emoji: '🏨', label: 'Hotel' },
  { slug: 'park', emoji: '🌳', label: 'Parque' },
  { slug: 'museum', emoji: '🏛️', label: 'Museo' },
  { slug: 'shop', emoji: '🛍️', label: 'Tienda' },
  { slug: 'viewpoint', emoji: '🌄', label: 'Mirador' },
  { slug: 'other', emoji: '📍', label: 'Otro' },
];

export default function ManualAdd({ onBack }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('restaurant');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [notes, setNotes] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const data = await geocodeSearch(searchQuery.trim());
      setSearchResults(data.results || []);
      if (data.results?.length === 0) {
        setError('No se encontraron resultados');
      }
    } catch (err) {
      setError('Error buscando ubicacion');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !selectedLocation) return;
    setSaving(true);
    setError(null);
    try {
      await createPlace({
        name: name.trim(),
        category,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: selectedLocation.address,
        city: selectedLocation.city,
        country: selectedLocation.country,
        source_type: 'manual',
        notes: notes.trim() || null,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-spots-bg p-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-spots-muted text-sm mb-4 hover:text-spots-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h2 className="text-xl font-bold text-spots-text mb-5">Agregar manualmente</h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-spots-muted text-xs font-medium mb-1 block">
            Nombre del lugar
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="La Docena Oyster Bar"
            className="w-full bg-spots-card border border-spots-border rounded-xl px-4 py-3 text-spots-text placeholder:text-spots-muted/50 focus:outline-none focus:border-spots-accent"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-spots-muted text-xs font-medium mb-2 block">
            Categoria
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  category === cat.slug
                    ? 'bg-spots-accent/20 text-spots-accent border border-spots-accent/30'
                    : 'bg-spots-card text-spots-muted border border-spots-border'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location search */}
        <div>
          <label className="text-spots-muted text-xs font-medium mb-1 block">
            Ubicacion
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar direccion o lugar..."
              className="flex-1 bg-spots-card border border-spots-border rounded-xl px-4 py-3 text-spots-text placeholder:text-spots-muted/50 focus:outline-none focus:border-spots-accent"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-spots-accent text-white px-4 rounded-xl hover:bg-spots-accent-light transition-colors disabled:opacity-50"
            >
              {searching ? '...' : '🔍'}
            </button>
          </div>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedLocation(result);
                  setSearchResults([]);
                  if (!name.trim()) setName(result.name || '');
                }}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  selectedLocation?.lat === result.lat
                    ? 'bg-spots-accent/10 border-spots-accent/30'
                    : 'bg-spots-card border-spots-border hover:border-spots-muted'
                }`}
              >
                <p className="text-spots-text text-sm font-medium">{result.name}</p>
                <p className="text-spots-muted text-xs">{result.address}</p>
              </button>
            ))}
          </div>
        )}

        {/* Selected location badge */}
        {selectedLocation && searchResults.length === 0 && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <span className="text-green-400">📍</span>
            <div className="flex-1">
              <p className="text-green-400 text-sm font-medium">{selectedLocation.name || selectedLocation.address}</p>
              <p className="text-green-400/60 text-xs">{selectedLocation.address}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-spots-muted text-xs font-medium mb-1 block">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Los mejores tacos de la ciudad..."
            rows={3}
            className="w-full bg-spots-card border border-spots-border rounded-xl px-4 py-3 text-spots-text placeholder:text-spots-muted/50 focus:outline-none focus:border-spots-accent resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || !selectedLocation}
          className="w-full bg-spots-accent text-white font-semibold py-3 rounded-xl hover:bg-spots-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar lugar'}
        </button>
      </div>
    </div>
  );
}
