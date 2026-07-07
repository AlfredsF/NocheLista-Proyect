import api from './api';

export async function crearReserva(data) {
  const response = await api.post('/reservas/', data);
  return response.data;
}

export async function misReservas() {
  const response = await api.get('/reservas/');
  return response.data;
}

export async function cancelarReserva(id) {
  const response = await api.delete(`/reservas/${id}/`);
  return response.data;
}
