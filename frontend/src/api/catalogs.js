import api from './axios';

export const catalogsApi = {
  // Get all catalog entries with client and product information
  getAll: async () => {
    const response = await api.get('/catalogs');
    return response.data;
  },

  // Get all active products across all catalogs (for public collections view)
  getAllProducts: async () => {
    const response = await api.get('/catalogs');
    // Transform catalog entries to products with client info
    return response.data
      .filter(entry => entry.active && entry.product)
      .map(entry => ({
        id: entry.product.id,
        nombre: entry.product.nombre,
        precio: entry.customPrice || entry.product.precio,
        description: entry.product.description,
        ruta: entry.product.ruta,
        stock: entry.product.stock,
        category: entry.product.category,
        catalogId: entry.id,
        active: entry.active,
        createdAt: entry.createdAt, // Include creation date for sorting
        // Client/store information
        clientId: entry.clientId,
        clientName: entry.client?.nombre || 'Tienda',
        clientLogo: entry.client?.logo,
        clientColor: entry.client?.color || '#f24427',
      }));
  },

  // Get recent products (newest catalog entries, within last 30 days or latest batch)
  getRecentProducts: async () => {
    const response = await api.get('/catalogs');
    const allEntries = response.data
      .filter(entry => entry.active && entry.product)
      .map(entry => ({
        id: entry.product.id,
        nombre: entry.product.nombre,
        precio: entry.customPrice || entry.product.precio,
        description: entry.product.description,
        ruta: entry.product.ruta,
        stock: entry.product.stock,
        category: entry.product.category,
        catalogId: entry.id,
        active: entry.active,
        createdAt: entry.createdAt,
        // Client/store information
        clientId: entry.clientId,
        clientName: entry.client?.nombre || 'Tienda',
        clientLogo: entry.client?.logo,
        clientColor: entry.client?.color || '#f24427',
      }));

    // Sort by creation date (newest first)
    allEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get products from last 30 days, or at least the 10 most recent if none in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProducts = allEntries.filter(entry => new Date(entry.createdAt) >= thirtyDaysAgo);
    
    // If no products in last 30 days, return the 10 most recent
    return recentProducts.length > 0 ? recentProducts : allEntries.slice(0, 10);
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
