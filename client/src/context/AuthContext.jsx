import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ud_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('ud_user', JSON.stringify(user));
    else localStorage.removeItem('ud_user');
  }, [user]);

  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await loginUser(payload);
      localStorage.setItem('ud_token', data.data.token);
      setUser(data.data.user);
      return data.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await registerUser(formData);
      localStorage.setItem('ud_token', data.data.token);
      setUser(data.data.user);
      return data.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('ud_token');
    localStorage.removeItem('ud_user');
    setUser(null);
  }, []);

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading, isAdmin, isSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
