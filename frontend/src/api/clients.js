import api from './axios';

export const clientsApi = {
  // Get all clients
  getAll: async () => {
    const response = await api.get('/clients');
    return response.data;
  },

  // Get single client
  getOne: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Get client by slug
  getBySlug: async (slug) => {
    const response = await api.get(`/clients/slug/${slug}`);
    return response.data;
  },

  // Get public store by slug (only returns if isStorePublic is true)
  getPublicStore: async (slug) => {
    const response = await api.get(`/clients/public-store/${slug}`);
    return response.data;
  },

  // Toggle store visibility
  toggleStoreVisibility: async (id) => {
    const response = await api.patch(`/clients/${id}/toggle-visibility`);
    return response.data;
  },

  // Set store visibility
  setStoreVisibility: async (id, isPublic) => {
    const response = await api.patch(`/clients/${id}/set-visibility`, { isPublic });
    return response.data;
  },

  // Check slug availability
  checkSlugAvailability: async (slug) => {
    const response = await api.get(`/clients/check-slug/${slug}`);
    return response.data;
  },

  // Get clients by user ID
  getByUserId: async (userId) => {
    const response = await api.get(`/clients/user/${userId}`);
    return response.data;
  },

  // Create new client
  create: async (client) => {
    const response = await api.post('/clients', client);
    return response.data;
  },

  // Update client
  update: async (id, updates) => {
    const response = await api.put(`/clients/${id}`, updates);
    return response.data;
  },

  // Delete client
  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};
