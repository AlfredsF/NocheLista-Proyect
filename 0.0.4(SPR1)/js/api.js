const API_BASE = 'http://localhost:8000/api';

function getToken() {
    return localStorage.getItem('nochelista_token') || sessionStorage.getItem('nochelista_token');
}

function getStoredUser() {
    const data = localStorage.getItem('nochelista_user') || sessionStorage.getItem('nochelista_user');
    return data ? JSON.parse(data) : null;
}

function clearSession() {
    localStorage.removeItem('nochelista_token');
    localStorage.removeItem('nochelista_user');
    sessionStorage.removeItem('nochelista_token');
    sessionStorage.removeItem('nochelista_user');
}

function saveSession(token, user, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('nochelista_token', token);
    storage.setItem('nochelista_user', JSON.stringify(user));
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        clearSession();
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'Carp_login/login.html';
        }
        throw new Error('Sesión expirada');
    }
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || data.detail || 'Error en la solicitud');
    }
    return data;
}

function updateNavGreeting() {
    const user = getStoredUser();
    const greeting = document.getElementById('userGreeting');
    if (!greeting) return;
    if (user) {
        const rolLabel = { cliente: 'Cliente', gestor: 'Gestor', admin: 'Admin' };
        const label = rolLabel[user.rol] || '';
        greeting.innerHTML = `
            Hola, <strong>${user.nombre_completo || user.email}</strong>
            <span class="badge bg-secondary ms-1" style="font-size:10px;">${label}</span>
            <a href="perfil.html" style="color: #333; text-decoration: none; font-size: 12px;">Perfil</a>
            | <a href="#" onclick="clearSession(); location.reload();" style="color: #ffc107; text-decoration: none;">Cerrar sesión</a>
        `;
    } else {
        greeting.innerHTML = '';
    }
}

function redirectByRole() {
    const user = getStoredUser();
    if (!user) return;
    if (user.rol === 'admin') {
        window.location.href = '../admin/dashboard.html';
    } else if (user.rol === 'gestor') {
        window.location.href = '../gestor/dashboard.html';
    } else if (user.rol === 'cliente') {
        window.location.href = '../index.html';
    }
}
