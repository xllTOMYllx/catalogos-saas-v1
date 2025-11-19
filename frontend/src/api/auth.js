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

  // Get current user profile (validates token)
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Forgot password - request reset email
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Verify reset token validity
  verifyResetToken: async (token) => {
    const response = await api.post('/auth/verify-reset-token', { token });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },
};
