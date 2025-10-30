import { useState } from 'react';
import { authApi } from '../api/auth';

// Hook Auth - now uses backend API
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check both authToken and role for authentication status
    return localStorage.getItem('authToken') !== null || localStorage.getItem('role') !== null;
  });

  const login = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
      if (result.success && result.token) {
        localStorage.setItem('authToken', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication-related data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('clientId');
      localStorage.removeItem('admin-storage');
      setIsAuthenticated(false);
    }
  };

  return { isAuthenticated, login, logout };
}
