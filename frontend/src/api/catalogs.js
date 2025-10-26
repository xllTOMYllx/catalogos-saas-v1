import api from './axios';

export const catalogsApi = {
  // Get all catalog entries
  getAll: async () => {
    const response = await api.get('/catalogs');
    return response.data;
  },

  // Get single catalog entry
  getOne: async (id) => {
    const response = await api.get(`/catalogs/${id}`);
    return response.data;
  },

  // Get catalog by client ID (all products in a client's catalog)
  getByClientId: async (clientId) => {
    const response = await api.get(`/catalogs/client/${clientId}`);
    return response.data;
  },

  // Add product to client's catalog
  create: async (catalog) => {
    const response = await api.post('/catalogs', catalog);
    return response.data;
  },

  // Update catalog entry (e.g., change custom price or active status)
  update: async (id, updates) => {
    const response = await api.put(`/catalogs/${id}`, updates);
    return response.data;
  },

  // Remove product from catalog
  delete: async (id) => {
    const response = await api.delete(`/catalogs/${id}`);
    return response.data;
  },
};
