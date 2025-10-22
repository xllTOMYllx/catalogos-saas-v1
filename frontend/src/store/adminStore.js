import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts } from '../database/products';  // Tu mock inicial

const initialBusiness = { nombre: 'UrbanStreet', logo: '/logosinfondo.png', color: '#f24427', telefono: '1234567890' };

export const useAdminStore = create(
  persist(
    (set, get) => ({
      activeId: 'default',  // ID activo
      catalogs: {
        default: { 
          products: initialProducts,
          business: initialBusiness
        },
      },

      // ✅ Load/clone for new user (llamado en LoginRole)
      loadProducts: (initial, userId = 'default', isClone = false) => {
        const state = get();
        let newId = userId || 'default-clone';
        if (isClone && !state.catalogs[newId]) {
          // Clona default para new cliente
          state.catalogs[newId] = {
            products: initial || [...state.catalogs.default.products],
            business: { ...state.catalogs.default.business }
          };
        }
        set({ catalogs: { ...state.catalogs } });
        set({ activeId: newId });  // Switch a new
      },

      // ✅ Nueva: Clear storage (reset to default, llamado en usuario mode)
      clearStorage: () => {
        set({ 
          activeId: 'default',
          catalogs: { default: { products: initialProducts, business: initialBusiness } }  // Reset full default
        });
      },

       // Switch active (llamado en LogoPortal onSwitch)
      setActiveCatalogId: (id) => set({ activeId: id }),

      // ✅ Get active data (usado en App/Header para render)
      getActiveCatalog: () => {
        const { activeId, catalogs } = get();
        return catalogs[activeId] || catalogs.default;  // Fallback
      },

      // Actions scopadas (mutan active catalog)
      addProduct: (product) => set((state) => {
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        active.products = [...active.products, { id: Date.now(), ...product, stock: product.stock || 10 }];
        const newCatalogs = { ...state.catalogs, [activeId]: active };
        return { catalogs: newCatalogs };
      }),
      
      updateProduct: (id, updated) => set((state) => {
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        active.products = active.products.map(p => p.id === id ? { ...p, ...updated } : p);
        const newCatalogs = { ...state.catalogs, [activeId]: active };
        return { catalogs: newCatalogs };
      }),

      deleteProduct: (id) => set((state) => {
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        active.products = active.products.filter(p => p.id !== id);
        const newCatalogs = { ...state.catalogs, [activeId]: active };
        return { catalogs: newCatalogs };
      }),

      updateBusiness: (updates) => set((state) => {
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        active.business = { ...active.business, ...updates };
        const newCatalogs = { ...state.catalogs, [activeId]: active };
        return { catalogs: newCatalogs };
      }),

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