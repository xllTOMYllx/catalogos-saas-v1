import { create } from 'zustand';

// Store para productos/admin (mock inicial con tu products.js)
export const useAdminStore = create((set, get) => ({
  products: [],  // Carga inicial de tu database/products
  business: { nombre: 'UrbanStreet', logo: '/logosinfondo.png', color: '#f24427' },  // Personalización

  loadProducts: () => set({ products: [] }),  // Más tarde: fetch de backend
  addProduct: (product) => set((state) => ({ products: [...state.products, { id: Date.now(), ...product, stock: 10 }] })),
  updateProduct: (id, updated) => set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, ...updated } : p) })),
  deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
  updateBusiness: (updates) => set((state) => ({ business: { ...state.business, ...updates } })),

  getTotalProducts: () => get().products.length,
}));