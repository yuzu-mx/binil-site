import { useState, useEffect, useCallback } from 'react';
import { getLists as fetchListsApi } from '../api/client';

export function useLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListsApi();
      setLists(data.lists || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return { lists, loading, error, refetch: fetchLists };
}
