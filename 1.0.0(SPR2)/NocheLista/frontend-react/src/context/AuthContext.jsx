import { createContext, useState, useEffect, useCallback } from 'react';
import { login as loginService, register as registerService } from '../services/authService';

export const AuthContext = createContext(null);

function getStoredUser() {
  const data = localStorage.getItem('nochelista_user') || sessionStorage.getItem('nochelista_user');
  return data ? JSON.parse(data) : null;
}

function getStoredToken() {
  return localStorage.getItem('nochelista_token') || sessionStorage.getItem('nochelista_token');
}

function saveSession(token, user, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('nochelista_token', token);
  storage.setItem('nochelista_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('nochelista_token');
  localStorage.removeItem('nochelista_user');
  sessionStorage.removeItem('nochelista_token');
  sessionStorage.removeItem('nochelista_user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;
  const rol = user?.rol || null;

  useEffect(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    if (t && u) {
      setToken(t);
      setUser(u);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, remember = false) => {
    const data = await loginService(email, password);
    saveSession(data.token, data.user, remember);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const registro = useCallback(async (data, remember = false) => {
    const result = await registerService(data);
    saveSession(result.token, result.user, remember);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    rol,
    isAuthenticated,
    loading,
    login,
    registro,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
