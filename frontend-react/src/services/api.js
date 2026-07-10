import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nochelista_token') || sessionStorage.getItem('nochelista_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nochelista_token');
      localStorage.removeItem('nochelista_user');
      sessionStorage.removeItem('nochelista_token');
      sessionStorage.removeItem('nochelista_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const msg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Error en la solicitud';
    return Promise.reject(new Error(msg));
  }
);

export default api;
