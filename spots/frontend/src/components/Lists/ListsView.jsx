import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLists, createList, deleteList } from '../../api/client';

export default function ListsView() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📋');
  const [creating, setCreating] = useState(false);

  const fetchLists = async () => {
    try {
      const data = await getLists();
      setLists(data.lists || []);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createList({ name: newName.trim(), emoji: newEmoji });
      setNewName('');
      setNewEmoji('📋');
      setShowCreate(false);
      fetchLists();
    } catch (err) {
      console.error('Create failed:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este board?')) return;
    try {
      await deleteList(id);
      fetchLists();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-spots-cream p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-spots-dark">Mis boards</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-spots-dark text-spots-cream text-sm font-semibold px-4 py-2 rounded-xl hover:bg-spots-dark-light transition-colors active:scale-[0.98]"
        >
          + Nuevo
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-spots-border rounded-2xl p-4 mb-4 space-y-3 animate-fade-in"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="w-14 bg-spots-surface border border-spots-border rounded-xl px-2 py-2.5 text-center text-xl focus:outline-none focus:border-spots-mint"
              maxLength={4}
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del board"
              className="flex-1 bg-spots-surface border border-spots-border rounded-xl px-4 py-2.5 text-spots-dark placeholder:text-spots-muted-light focus:outline-none focus:border-spots-mint"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 rounded-xl text-sm text-spots-muted bg-spots-surface border border-spots-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-spots-cream bg-spots-dark disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-2xl animate-pulse-dot mb-2">📋</div>
          <p className="text-spots-muted text-sm">Cargando boards...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && lists.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-spots-dark font-semibold mb-1">Sin boards aun</p>
          <p className="text-spots-muted text-sm">
            Crea uno para organizar tus spots!
          </p>
        </div>
      )}

      {/* Lists grid */}
      <div className="grid grid-cols-2 gap-3">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-white border border-spots-border rounded-2xl p-4 hover:border-spots-mint hover:shadow-sm transition-all cursor-pointer relative group"
          >
            <div onClick={() => navigate(`/lists/${list.id}`)}>
              <span className="text-3xl block mb-2">{list.emoji || '📋'}</span>
              <h3 className="text-spots-dark font-semibold text-sm truncate">
                {list.name}
              </h3>
              <p className="text-spots-muted text-xs mt-1">
                {list.place_count || 0} spots
              </p>
            </div>
            <button
              onClick={() => handleDelete(list.id)}
              className="absolute top-2 right-2 text-spots-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
