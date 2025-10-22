import { useState } from 'react';

// Hook Auth Stub (simula con localStorage —sin backend)
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('authToken') === 'mock-token';
  });

  const login = (email, password) => {
    if (email === 'admin@test.com' && password === '123') {
      localStorage.setItem('authToken', 'mock-token');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}