import { useState } from 'react';
import { deletePlace, updatePlace } from '../../api/client';

const CATEGORIES = {
  restaurant: { emoji: '🍽️', label: 'Restaurante' },
  bar: { emoji: '🍺', label: 'Bar' },
  cafe: { emoji: '☕', label: 'Cafe' },
  beach: { emoji: '🏖️', label: 'Playa' },
  club: { emoji: '🎶', label: 'Club' },
  hotel: { emoji: '🏨', label: 'Hotel' },
  park: { emoji: '🌳', label: 'Parque' },
  museum: { emoji: '🏛️', label: 'Museo' },
  shop: { emoji: '🛍️', label: 'Tienda' },
  viewpoint: { emoji: '🌄', label: 'Mirador' },
  other: { emoji: '📍', label: 'Otro' },
};

export default function PinDetail({ place, onClose, onUpdate }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const category = CATEGORIES[place.category] || CATEGORIES.other;

  const handleDelete = async () => {
    if (!confirm('Eliminar este lugar?')) return;
    setDeleting(true);
    try {
      await deletePlace(place.id);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  const handleToggleVisited = async () => {
    setToggling(true);
    try {
      await updatePlace(place.id, { visited: !place.visited });
      onUpdate();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
      {/* Backdrop */}
      <div className="absolute inset-0 -top-[100vh]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-spots-cream rounded-t-3xl p-5 pb-8 shadow-2xl border-t border-spots-border">
        {/* Handle */}
        <div className="w-10 h-1 bg-spots-border rounded-full mx-auto mb-4" />

        {/* Thumbnail + Info */}
        <div className="flex items-start gap-4 mb-4">
          {place.thumbnail_url ? (
            <img
              src={place.thumbnail_url}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border border-spots-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-spots-mint/20 flex items-center justify-center text-2xl border border-spots-mint/30">
              {place.emoji || category.emoji}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-spots-dark truncate">
              {place.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm">{category.emoji}</span>
              <span className="text-spots-muted text-sm">{category.label}</span>
            </div>
            {place.city && (
              <p className="text-spots-muted text-sm mt-0.5">
                📍 {place.city}{place.country ? `, ${place.country}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-spots-muted hover:text-spots-dark p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Address */}
        {place.address && (
          <p className="text-spots-muted text-sm mb-3 bg-spots-surface rounded-xl p-3">
            {place.address}
          </p>
        )}

        {/* Notes */}
        {place.notes && (
          <p className="text-spots-dark text-sm mb-3 bg-spots-mint/10 border border-spots-mint/20 rounded-xl p-3">
            {place.notes}
          </p>
        )}

        {/* Source link */}
        {place.source_url && (
          <a
            href={place.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-spots-dark bg-spots-surface border border-spots-border rounded-xl px-3 py-2 text-sm mb-4 hover:bg-spots-border transition-colors"
          >
            {place.source_type === 'tiktok' ? (
              <span className="text-base">🎵</span>
            ) : place.source_type === 'instagram' ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            )}
            Ver {place.source_type === 'tiktok' ? 'TikTok' : place.source_type === 'instagram' ? 'Reel' : 'fuente'}
          </a>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleToggleVisited}
            disabled={toggling}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              place.visited
                ? 'bg-spots-mint text-spots-dark'
                : 'bg-spots-dark text-spots-cream'
            }`}
          >
            {place.visited ? '✓ Visitado' : 'Marcar visitado'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="py-2.5 px-4 rounded-xl text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            {deleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
