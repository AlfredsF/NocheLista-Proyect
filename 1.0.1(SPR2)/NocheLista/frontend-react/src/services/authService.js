import api from './api';

export async function login(email, password) {
  const response = await api.post('/auth/login/', { email, password });
  return response.data;
}

export async function register(data) {
  const response = await api.post('/auth/register/', data);
  return response.data;
}

export async function fetchProfile() {
  const response = await api.get('/auth/me/');
  return response.data;
}

export async function updateProfile(data) {
  const response = await api.put('/auth/me/', data);
  return response.data;
}
