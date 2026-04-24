const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders() {
  // Firebase auth token will be injected by the auth context
  const token = window.__spotsAuthToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Places
export const getPlaces = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/places${qs ? `?${qs}` : ''}`);
};

export const getPlace = (id) => request(`/places/${id}`);

export const createPlace = (data) =>
  request('/places', { method: 'POST', body: JSON.stringify(data) });

export const updatePlace = (id, data) =>
  request(`/places/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deletePlace = (id) =>
  request(`/places/${id}`, { method: 'DELETE' });

// Lists
export const getLists = () => request('/lists');

export const createList = (data) =>
  request('/lists', { method: 'POST', body: JSON.stringify(data) });

export const updateList = (id, data) =>
  request(`/lists/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteList = (id) =>
  request(`/lists/${id}`, { method: 'DELETE' });

// Import
export const importUrl = (url, hint) =>
  request('/import/url', {
    method: 'POST',
    body: JSON.stringify({ url, hint }),
  });

// Geocode
export const geocodeSearch = (query) =>
  request(`/geocode?q=${encodeURIComponent(query)}`);
