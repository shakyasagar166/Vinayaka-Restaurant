import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('vr_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vr_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const res = await api.login(username, password);
    setToken(res.token);
    setUser({
      username: res.username,
      fullName: res.fullName,
      role: res.role
    });
    localStorage.setItem('vr_token', res.token);
    localStorage.setItem('vr_user', JSON.stringify({
      username: res.username,
      fullName: res.fullName,
      role: res.role
    }));
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vr_token');
    localStorage.removeItem('vr_user');
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
