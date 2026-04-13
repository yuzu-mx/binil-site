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
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Backdrop */}
      <div className="absolute inset-0 -top-[100vh]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-spots-surface rounded-t-2xl p-5 pb-8 shadow-2xl border-t border-spots-border bottom-sheet-active">
        {/* Handle */}
        <div className="w-10 h-1 bg-spots-border rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{place.emoji || category.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-spots-text truncate">
              {place.name}
            </h3>
            <p className="text-spots-muted text-sm">{category.label}</p>
          </div>
          <button
            onClick={onClose}
            className="text-spots-muted hover:text-spots-text p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Address */}
        {place.address && (
          <p className="text-spots-muted text-sm mb-2">{place.address}</p>
        )}

        {/* Notes */}
        {place.notes && (
          <p className="text-spots-text text-sm mb-3 bg-spots-card rounded-lg p-3">
            {place.notes}
          </p>
        )}

        {/* Source link */}
        {place.source_url && (
          <a
            href={place.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-spots-accent text-sm mb-4 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Ver {place.source_type === 'tiktok' ? 'TikTok' : place.source_type === 'instagram' ? 'Reel' : 'fuente'}
          </a>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleToggleVisited}
            disabled={toggling}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              place.visited
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-spots-card text-spots-text border border-spots-border'
            }`}
          >
            {place.visited ? '✓ Visitado' : 'Marcar visitado'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="py-2.5 px-4 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            {deleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
