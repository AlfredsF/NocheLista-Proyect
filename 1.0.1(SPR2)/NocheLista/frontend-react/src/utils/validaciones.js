export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

export function getStarsHtml(count) {
  return '&#9733;'.repeat(count) + '&#9734;'.repeat(5 - count);
}

export function showMessage(el, text, type = 'info') {
  if (!el) return;
  const colors = { info: 'gray', success: 'green', error: 'red', warning: 'orange' };
  el.style.color = colors[type] || 'gray';
  el.textContent = text;
}

export function showLoading(el) {
  if (el) el.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><p class="mt-2 text-muted">Cargando...</p></div>';
}

export function renderStars(container, count) {
  if (!container) return;
  container.innerHTML = getStarsHtml(count);
}

export function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function calcularNoches(entrada, salida) {
  if (!entrada || !salida) return 0;
  const e = new Date(entrada + 'T00:00:00');
  const s = new Date(salida + 'T00:00:00');
  return Math.max(0, Math.ceil((s - e) / (1000 * 60 * 60 * 24)));
}

export const tipoHabitacionLabels = {
  standard: 'Estándar',
  deluxe: 'Deluxe',
  suite: 'Suite'
};
