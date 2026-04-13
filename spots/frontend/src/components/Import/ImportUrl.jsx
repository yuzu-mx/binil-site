import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importUrl, createPlace } from '../../api/client';
import ManualAdd from './ManualAdd';

export default function ImportUrl() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [hint, setHint] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('url'); // 'url' | 'manual'
  const [saving, setSaving] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await importUrl(url.trim(), hint.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'No se pudo procesar la URL');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result?.place) return;
    setSaving(true);
    try {
      await createPlace({
        name: result.place.name,
        category: result.place.category,
        lat: result.place.lat,
        lng: result.place.lng,
        address: result.place.address,
        city: result.place.city,
        country: result.place.country,
        source_url: url,
        source_type: result.source,
        source_title: result.title,
        source_author: result.author,
        thumbnail_url: result.thumbnail,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (mode === 'manual') {
    return <ManualAdd onBack={() => setMode('url')} />;
  }

  return (
    <div className="h-full overflow-y-auto bg-spots-bg p-5">
      <h2 className="text-xl font-bold text-spots-text mb-1">Agregar lugar</h2>
      <p className="text-spots-muted text-sm mb-6">
        Pega una URL de Instagram o TikTok y encontraremos el lugar
      </p>

      {/* URL Form */}
      <form onSubmit={handleImport} className="space-y-3 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="w-full bg-spots-card border border-spots-border rounded-xl px-4 py-3 text-spots-text placeholder:text-spots-muted/50 focus:outline-none focus:border-spots-accent transition-colors"
        />
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Pista: nombre del lugar o ciudad (opcional)"
          className="w-full bg-spots-card border border-spots-border rounded-xl px-4 py-3 text-spots-text placeholder:text-spots-muted/50 focus:outline-none focus:border-spots-accent transition-colors"
        />
        <button
          type="submit"
          disabled={processing || !url.trim()}
          className="w-full bg-spots-accent text-white font-semibold py-3 rounded-xl hover:bg-spots-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-pulse-dot">🔍</span> Buscando lugar...
            </span>
          ) : (
            'Buscar lugar'
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Result preview */}
      {result?.place && (
        <div className="bg-spots-card border border-spots-border rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt=""
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="text-spots-text font-semibold">
                {result.place.emoji} {result.place.name}
              </h3>
              <p className="text-spots-muted text-sm">{result.place.address}</p>
              <p className="text-spots-muted text-xs mt-1">
                {result.place.city}, {result.place.country}
              </p>
              {result.place.confidence && (
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    result.place.confidence === 'high'
                      ? 'bg-green-500/20 text-green-400'
                      : result.place.confidence === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  Confianza: {result.place.confidence}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleSaveResult}
            disabled={saving}
            className="w-full bg-spots-accent text-white font-semibold py-2.5 rounded-xl hover:bg-spots-accent-light transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar en mi mapa'}
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-spots-border" />
        <span className="text-spots-muted text-xs">o</span>
        <div className="flex-1 h-px bg-spots-border" />
      </div>

      {/* Manual add */}
      <button
        onClick={() => setMode('manual')}
        className="w-full bg-spots-card border border-spots-border text-spots-text font-medium py-3 rounded-xl hover:bg-spots-surface transition-colors"
      >
        Agregar manualmente
      </button>
    </div>
  );
}
