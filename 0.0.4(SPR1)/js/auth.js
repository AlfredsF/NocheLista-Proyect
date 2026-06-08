async function handleLogin(email, password, remember = false) {
    const data = await apiFetch('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    saveSession(data.token, data.user, remember);
    return data.user;
}

async function handleRegister(data, remember = false) {
    const result = await apiFetch('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    saveSession(result.token, result.user, remember);
    return result.user;
}

async function handleLogout() {
    clearSession();
    window.location.href = 'index.html';
}

async function fetchProfile() {
    return await apiFetch('/auth/me/');
}

async function updateProfile(data) {
    return await apiFetch('/auth/me/', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
