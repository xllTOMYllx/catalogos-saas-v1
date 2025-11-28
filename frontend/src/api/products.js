import api from './axios';

export const productsApi = {
  // Get all products
  getAll: async (includeVariants = false) => {
    const response = await api.get('/products', {
      params: includeVariants ? { includeVariants: 'true' } : {},
    });
    return response.data;
  },

  // Get single product
  getOne: async (id, includeVariants = false) => {
    const response = await api.get(`/products/${id}`, {
      params: includeVariants ? { includeVariants: 'true' } : {},
    });
    return response.data;
  },

  // Create new product
  create: async (product) => {
    const response = await api.post('/products', product);
    return response.data;
  },

  // Update product
  update: async (id, updates) => {
    const response = await api.put(`/products/${id}`, updates);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },

  // Get variants for a product
  getVariants: async (productId) => {
    const response = await api.get(`/product-variants/product/${productId}`);
    return response.data;
  },

  // Create a variant
  createVariant: async (variant) => {
    const response = await api.post('/product-variants', variant);
    return response.data;
  },

  // Create multiple variants
  createVariantsBulk: async (variants) => {
    const response = await api.post('/product-variants/bulk', variants);
    return response.data;
  },

  // Update a variant
  updateVariant: async (id, updates) => {
    const response = await api.put(`/product-variants/${id}`, updates);
    return response.data;
  },

  // Update variant stock
  updateVariantStock: async (id, stockChange) => {
    const response = await api.put(`/product-variants/${id}/stock`, { stockChange });
    return response.data;
  },

  // Delete a variant
  deleteVariant: async (id) => {
    await api.delete(`/product-variants/${id}`);
  },
};
