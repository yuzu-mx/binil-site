import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaces, getLists } from '../../api/client';

export default function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [listsData, placesData] = await Promise.all([
          getLists(),
          getPlaces({ list_id: id }),
        ]);
        const found = listsData.lists?.find((l) => l.id === id);
        setList(found || { name: 'Lista', emoji: '📋' });
        setPlaces(placesData.places || []);
      } catch (err) {
        console.error('Failed to fetch list:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  return (
    <div className="h-full overflow-y-auto bg-spots-bg p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/lists')}
          className="text-spots-muted hover:text-spots-text transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        {list && (
          <>
            <span className="text-2xl">{list.emoji || '📋'}</span>
            <h2 className="text-xl font-bold text-spots-text">{list.name}</h2>
          </>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-2xl animate-pulse-dot">📍</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && places.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📍</div>
          <p className="text-spots-muted text-sm">
            Esta lista esta vacia. Agrega lugares desde el mapa!
          </p>
        </div>
      )}

      {/* Places list */}
      <div className="space-y-2">
        {places.map((place) => (
          <div
            key={place.id}
            className="bg-spots-card border border-spots-border rounded-xl p-4 flex items-center gap-3"
          >
            {place.thumbnail_url ? (
              <img
                src={place.thumbnail_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-spots-surface flex items-center justify-center text-xl">
                {place.emoji || '📍'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-spots-text font-medium text-sm truncate">
                {place.name}
              </h3>
              <p className="text-spots-muted text-xs truncate">
                {place.address || place.city || 'Sin ubicacion'}
              </p>
            </div>
            {place.visited && (
              <span className="text-green-400 text-xs">✓</span>
            )}
            {place.source_url && (
              <a
                href={place.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-spots-accent"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
