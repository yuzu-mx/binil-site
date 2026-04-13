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
    <div className="h-full overflow-y-auto bg-spots-cream p-5">
      <h2 className="text-2xl font-bold text-spots-dark mb-1">Agregar spot</h2>
      <p className="text-spots-muted text-sm mb-6">
        Pega un link de TikTok o Instagram y encontramos el lugar
      </p>

      {/* URL Form */}
      <form onSubmit={handleImport} className="space-y-3 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="E.g. https://www.tiktok.com/@user/video..."
          className="w-full bg-white border border-spots-border rounded-2xl px-4 py-3.5 text-spots-dark placeholder:text-spots-muted-light focus:outline-none focus:border-spots-mint focus:ring-2 focus:ring-spots-mint/20 transition-all"
        />
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Pista: nombre del lugar o ciudad (opcional)"
          className="w-full bg-white border border-spots-border rounded-2xl px-4 py-3.5 text-spots-dark placeholder:text-spots-muted-light focus:outline-none focus:border-spots-mint focus:ring-2 focus:ring-spots-mint/20 transition-all"
        />
        <button
          type="submit"
          disabled={processing || !url.trim()}
          className="w-full bg-spots-dark text-spots-cream font-semibold py-3.5 rounded-2xl hover:bg-spots-dark-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Result preview */}
      {result?.place && (
        <div className="bg-spots-mint/10 border border-spots-mint/30 rounded-2xl p-4 mb-4 animate-fade-in">
          <div className="flex items-start gap-3 mb-3">
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt=""
                className="w-16 h-16 rounded-xl object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="text-spots-dark font-bold">
                {result.place.emoji} {result.place.name}
              </h3>
              <p className="text-spots-muted text-sm">{result.place.address}</p>
              <p className="text-spots-muted text-xs mt-1">
                {result.place.city}{result.place.country ? `, ${result.place.country}` : ''}
              </p>
              {result.place.confidence && (
                <span
                  className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                    result.place.confidence === 'high'
                      ? 'bg-spots-mint/20 text-spots-dark'
                      : result.place.confidence === 'medium'
                        ? 'bg-spots-yellow/30 text-spots-dark'
                        : 'bg-red-100 text-red-600'
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
            className="w-full bg-spots-mint text-spots-dark font-semibold py-3 rounded-xl hover:bg-spots-mint-dark transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? 'Guardando...' : '📍 Guardar en mi mapa'}
          </button>
        </div>
      )}

      {/* No place found */}
      {result && !result.place && (
        <div className="bg-spots-yellow/15 border border-spots-yellow/30 rounded-2xl p-4 mb-4">
          <p className="text-spots-dark text-sm font-medium">No se encontro el lugar</p>
          <p className="text-spots-muted text-sm mt-1">
            {result.message || 'Intenta agregar una pista o usa el modo manual.'}
          </p>
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
        className="w-full bg-white border border-spots-border text-spots-dark font-medium py-3.5 rounded-2xl hover:bg-spots-surface transition-colors active:scale-[0.98]"
      >
        Agregar manualmente
      </button>
    </div>
  );
}
