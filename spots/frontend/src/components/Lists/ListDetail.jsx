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
        setList(found || { name: 'Board', emoji: '📋' });
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
    <div className="h-full overflow-y-auto bg-spots-cream p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/lists')}
          className="text-spots-muted hover:text-spots-dark transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        {list && (
          <>
            <span className="text-2xl">{list.emoji || '📋'}</span>
            <div>
              <h2 className="text-xl font-bold text-spots-dark">{list.name}</h2>
              <p className="text-spots-muted text-xs">{places.length} spots</p>
            </div>
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
          <div className="text-5xl mb-4">📍</div>
          <p className="text-spots-dark font-semibold mb-1">Board vacio</p>
          <p className="text-spots-muted text-sm">
            Agrega spots desde el mapa!
          </p>
        </div>
      )}

      {/* Places list */}
      <div className="space-y-2">
        {places.map((place) => (
          <div
            key={place.id}
            className="bg-white border border-spots-border rounded-2xl p-4 flex items-center gap-3 hover:border-spots-mint transition-all"
          >
            {place.thumbnail_url ? (
              <img
                src={place.thumbnail_url}
                alt=""
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-spots-mint/10 flex items-center justify-center text-xl border border-spots-mint/20">
                {place.emoji || '📍'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-spots-dark font-semibold text-sm truncate">
                {place.name}
              </h3>
              <p className="text-spots-muted text-xs truncate">
                📍 {place.city || place.address || 'Sin ubicacion'}
              </p>
            </div>
            {place.visited && (
              <span className="text-spots-mint text-sm font-bold">✓</span>
            )}
            {place.source_url && (
              <a
                href={place.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-spots-dark hover:text-spots-mint transition-colors"
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
