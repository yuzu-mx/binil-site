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
    if (!confirm('Eliminar esta lista?')) return;
    try {
      await deleteList(id);
      fetchLists();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-spots-bg p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-spots-text">Mis listas</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-spots-accent text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-spots-accent-light transition-colors"
        >
          + Nueva
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-spots-card border border-spots-border rounded-xl p-4 mb-4 space-y-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="w-14 bg-spots-surface border border-spots-border rounded-xl px-2 py-2.5 text-center text-xl focus:outline-none focus:border-spots-accent"
              maxLength={4}
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre de la lista"
              className="flex-1 bg-spots-surface border border-spots-border rounded-xl px-4 py-2.5 text-spots-text placeholder:text-spots-muted/50 focus:outline-none focus:border-spots-accent"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2 rounded-xl text-sm text-spots-muted bg-spots-surface border border-spots-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-spots-accent disabled:opacity-50"
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
          <p className="text-spots-muted text-sm">Cargando listas...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && lists.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-spots-muted text-sm">
            Aun no tienes listas. Crea una para organizar tus spots!
          </p>
        </div>
      )}

      {/* Lists grid */}
      <div className="grid grid-cols-2 gap-3">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-spots-card border border-spots-border rounded-xl p-4 hover:border-spots-muted transition-colors cursor-pointer relative group"
          >
            <div onClick={() => navigate(`/lists/${list.id}`)}>
              <span className="text-2xl block mb-2">{list.emoji || '📋'}</span>
              <h3 className="text-spots-text font-medium text-sm truncate">
                {list.name}
              </h3>
              <p className="text-spots-muted text-xs mt-1">
                {list.place_count || 0} lugares
              </p>
            </div>
            <button
              onClick={() => handleDelete(list.id)}
              className="absolute top-2 right-2 text-spots-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
