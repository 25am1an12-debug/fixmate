import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearToken } from '../api/client.js';

const AuthContext = createContext(null);
const LS_SESSION = 'fixmate_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_SESSION));
      if (saved) setUser(saved);
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const login = (u) => {
    setUser(u);
    localStorage.setItem(LS_SESSION, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_SESSION);
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
