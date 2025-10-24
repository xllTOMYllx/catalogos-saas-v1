import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts } from '../database/products';
import { productsApi } from '../api/products';
import { businessApi } from '../api/business';

const initialBusiness = { nombre: 'UrbanStreet', logo: '/logosinfondo.png', color: '#f24427', telefono: '1234567890' };

export const useAdminStore = create(
  persist(
    (set, get) => ({
      activeId: 'default',
      catalogs: {
        default: { 
          products: initialProducts,
          business: initialBusiness
        },
      },
      loading: false,
      error: null,

      // Load products from backend
      loadProducts: async (initial, userId = 'default', isClone = false) => {
        const state = get();
        try {
          set({ loading: true, error: null });
          
          // Load products from backend
          const products = await productsApi.getAll();
          const business = await businessApi.get();
          
          let newId = userId || 'default-clone';
          if (isClone && !state.catalogs[newId]) {
            // Clone for new client
            state.catalogs[newId] = {
              products: products || initial || [...state.catalogs.default.products],
              business: business || { ...state.catalogs.default.business }
            };
          } else {
            // Update existing catalog
            if (!state.catalogs[newId]) {
              state.catalogs[newId] = {
                products: [],
                business: { ...initialBusiness }
              };
            }
            state.catalogs[newId].products = products || [];
            state.catalogs[newId].business = business || { ...initialBusiness };
          }
          
          set({ 
            catalogs: { ...state.catalogs },
            activeId: newId,
            loading: false 
          });
        } catch (error) {
          console.error('Error loading products:', error);
          set({ loading: false, error: error.message });
          // Fallback to local data
          let newId = userId || 'default-clone';
          if (isClone && !state.catalogs[newId]) {
            state.catalogs[newId] = {
              products: initial || [...state.catalogs.default.products],
              business: { ...state.catalogs.default.business }
            };
          }
          set({ catalogs: { ...state.catalogs }, activeId: newId });
        }
      },

      clearStorage: () => {
        set({ 
          activeId: 'default',
          catalogs: { default: { products: initialProducts, business: initialBusiness } },
          loading: false,
          error: null
        });
      },

      setActiveCatalogId: (id) => set({ activeId: id }),

      getActiveCatalog: () => {
        const { activeId, catalogs } = get();
        return catalogs[activeId] || catalogs.default;
      },

      // Add product (with backend sync)
      addProduct: async (product) => {
        const state = get();
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        
        try {
          set({ loading: true, error: null });
          
          // Create in backend
          const newProduct = await productsApi.create(product);
          
          // Update local state
          active.products = [...active.products, newProduct];
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error adding product:', error);
          set({ loading: false, error: error.message });
          
          // Fallback to local
          active.products = [...active.products, { id: Date.now(), ...product, stock: product.stock || 10 }];
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs });
        }
      },
      
      // Update product (with backend sync)
      updateProduct: async (id, updated) => {
        const state = get();
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        
        try {
          set({ loading: true, error: null });
          
          // Update in backend
          await productsApi.update(id, updated);
          
          // Update local state
          active.products = active.products.map(p => p.id === id ? { ...p, ...updated } : p);
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error updating product:', error);
          set({ loading: false, error: error.message });
          
          // Fallback to local
          active.products = active.products.map(p => p.id === id ? { ...p, ...updated } : p);
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs });
        }
      },

      // Delete product (with backend sync)
      deleteProduct: async (id) => {
        const state = get();
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        
        try {
          set({ loading: true, error: null });
          
          // Delete from backend
          await productsApi.delete(id);
          
          // Update local state
          active.products = active.products.filter(p => p.id !== id);
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error deleting product:', error);
          set({ loading: false, error: error.message });
          
          // Fallback to local
          active.products = active.products.filter(p => p.id !== id);
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs });
        }
      },

      // Update business (with backend sync)
      updateBusiness: async (updates) => {
        const state = get();
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        
        try {
          set({ loading: true, error: null });
          
          // Update in backend
          const updatedBusiness = await businessApi.update(updates);
          
          // Update local state
          active.business = updatedBusiness;
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error updating business:', error);
          set({ loading: false, error: error.message });
          
          // Fallback to local
          active.business = { ...active.business, ...updates };
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs });
        }
      },

      filterProducts: (query) => {
        const active = get().getActiveCatalog();
        return query ? active.products.filter(p => p.nombre.toLowerCase().includes(query.toLowerCase())) :
          active.products;
      },

      getTotalProducts: () => get().getActiveCatalog().products.length,
      getTotalStock: () => get().getActiveCatalog().products.reduce((sum, p) => sum + (p.stock || 0), 0),

      saveAll: () => {
        const state = get();
        localStorage.setItem('admin-storage', JSON.stringify(state));
        return state;
      },
    }),
    { name: 'admin-storage' }
  )
);
