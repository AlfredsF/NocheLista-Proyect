import api from './api';

export async function buscarHoteles(params = {}) {
  const { nombre, ciudad, estrellas, precio_max } = params;
  const queryParts = [];
  if (nombre) queryParts.push(`nombre=${encodeURIComponent(nombre)}`);
  if (ciudad) queryParts.push(`ciudad=${encodeURIComponent(ciudad)}`);
  if (estrellas) queryParts.push(`estrellas=${estrellas}`);
  if (precio_max) queryParts.push(`precio_max=${precio_max}`);

  if (queryParts.length > 0) {
    const response = await api.get('/buscar/?' + queryParts.join('&'));
    return response.data;
  }
  const response = await api.get('/hoteles/');
  return response.data;
}

export async function obtenerDetalle(id) {
  const response = await api.get(`/hoteles/${id}/`);
  return response.data;
}
