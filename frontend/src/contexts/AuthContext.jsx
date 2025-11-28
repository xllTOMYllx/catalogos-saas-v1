import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state from localStorage and validate token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Validate token with backend
          const response = await authApi.me();
          
          if (response.success && response.user) {
            setUser(response.user);
            setClient(response.client || null);
            setIsAuthenticated(true);
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(response.user));
            if (response.client) {
              localStorage.setItem('clientId', response.client.id.toString());
            }
          } else {
            // Token is invalid, clear everything
            clearAuth();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid or network error, clear auth
          clearAuth();
        }
      } else {
        // No token, check if there's old session data to clean up
        const hasOldData = localStorage.getItem('user') || localStorage.getItem('role');
        if (hasOldData) {
          clearAuth();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setClient(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('clientId');
    // También limpiar sessionStorage para mayor seguridad
    sessionStorage.clear();
  };

  const login = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
      
      if (result.success && result.token && result.user) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('role', result.user.role);
        
        if (result.client) {
          localStorage.setItem('clientId', result.client.id.toString());
          setClient(result.client);
        }
        
        setUser(result.user);
        setIsAuthenticated(true);
        
        return { success: true, user: result.user, client: result.client };
      }
      
      return { success: false, message: result.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (email, password, nombre, businessName, telefono) => {
    try {
      const result = await authApi.register(email, password, nombre, businessName, telefono);
      
      if (result.success && result.token && result.user) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('role', result.user.role);
        
        if (result.client) {
          localStorage.setItem('clientId', result.client.id.toString());
          setClient(result.client);
        }
        
        setUser(result.user);
        setIsAuthenticated(true);
        
        return { success: true, user: result.user, client: result.client };
      }
      
      return { success: false, message: result.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      
      // Limpiar cache del navegador para páginas protegidas (si está disponible)
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (cacheError) {
          // Ignorar errores de cache - no es crítico para el logout
          console.debug('Cache clearing skipped:', cacheError);
        }
      }
    }
  };

  const value = {
    user,
    client,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the context for use in the hook
export { AuthContext };
