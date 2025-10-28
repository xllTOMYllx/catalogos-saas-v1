import api from './axios';

export const authApi = {
  // Register new client
  register: async (email, password, nombre, businessName, telefono = '') => {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      nombre, 
      businessName,
      telefono 
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
