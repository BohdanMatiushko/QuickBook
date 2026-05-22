import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { ensureCsrf } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    ensureCsrf().then(refreshUser);
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    setUser(res.data);
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register/', payload);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch {
      /* ignore */
    }
    setUser(null);
  };

  const isSpecialist = user?.role === 'specialist' || user?.is_employee;
  const isClient = user?.role === 'client' || user?.is_client;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isSpecialist,
        isClient,
        isAuthenticated: !!user,
      }}
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
