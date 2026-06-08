function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

function getStarsHtml(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function showMessage(el, text, type = 'info') {
    if (!el) return;
    const colors = { info: 'gray', success: 'green', error: 'red', warning: 'orange' };
    el.style.color = colors[type] || 'gray';
    el.textContent = text;
}

function showLoading(el) {
    if (el) el.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><p class="mt-2 text-muted">Cargando...</p></div>';
}

function renderStars(container, count) {
    if (!container) return;
    container.innerHTML = getStarsHtml(count);
}

function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function calcularNoches(entrada, salida) {
    if (!entrada || !salida) return 0;
    const e = new Date(entrada + 'T00:00:00');
    const s = new Date(salida + 'T00:00:00');
    return Math.max(0, Math.ceil((s - e) / (1000 * 60 * 60 * 24)));
}

const tipoHabitacionLabels = {
    standard: 'Estándar',
    deluxe: 'Deluxe',
    suite: 'Suite'
};
