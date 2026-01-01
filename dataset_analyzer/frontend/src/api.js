const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  
  return response.json();
}

export const api = {
  browse: (path) => fetchApi(`/browse?path=${encodeURIComponent(path || '')}`),
  loadDataset: (path) => fetchApi(`/dataset/load?path=${encodeURIComponent(path)}`, { method: 'POST' }),
  getDatasetInfo: () => fetchApi('/dataset/info'),
  getOverviewStats: () => fetchApi('/stats/overview'),
  getBoxStats: () => fetchApi('/stats/boxes'),
  getImageStats: () => fetchApi('/stats/images'),
  getSpatialStats: () => fetchApi('/stats/spatial'),
  getImages: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/images?${query}`);
  },
  getImage: (id) => fetchApi(`/images/${id}`),
  getImageUrl: (id) => `${API_BASE}/images/${id}/file`,
  getClasses: () => fetchApi('/classes'),
  getSplits: () => fetchApi('/splits')
};
