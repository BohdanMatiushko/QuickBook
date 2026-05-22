import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
  withCredentials: true,
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCookie('csrftoken');
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

let csrfReady = null;

export async function ensureCsrf() {
  if (!csrfReady) {
    csrfReady = api.get('/auth/csrf/').catch(() => null);
  }
  return csrfReady;
}

export default api;
