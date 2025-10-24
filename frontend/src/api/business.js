import api from './axios';

export const businessApi = {
  // Get business info
  get: async () => {
    const response = await api.get('/business');
    return response.data;
  },

  // Update business info
  update: async (updates) => {
    const response = await api.put('/business', updates);
    return response.data;
  },
};
