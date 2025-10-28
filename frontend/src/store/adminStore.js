import { create } from 'zustand';
import { products as initialProducts } from '../database/products';
import { productsApi } from '../api/products';
import { businessApi } from '../api/business';
import { catalogsApi } from '../api/catalogs';
import { clientsApi } from '../api/clients';

const initialBusiness = { nombre: 'UrbanStreet', logo: '/logosinfondo.png', color: '#f24427', telefono: '1234567890' };

// Helper to determine if we're viewing the default catalog
const isDefaultCatalog = (catalogId) => {
  return !catalogId || catalogId === 'default' || catalogId === '1';
};

export const useAdminStore = create(
    (set, get) => ({
      activeId: 'default',
      clientId: null, // Backend client ID for current user
      catalogs: {
        default: { 
          products: initialProducts,
          business: initialBusiness,
          isReadOnly: true // Mark default as read-only
        },
      },
      loading: false,
      error: null,

      // Load catalog data for a specific client
      loadCatalog: async (clientId, slug = null) => {
        const state = get();
        try {
          set({ loading: true, error: null });
          
          if (isDefaultCatalog(clientId)) {
            // For default catalog, load from products API (master catalog)
            const products = await productsApi.getAll();
            const business = await businessApi.get();
            
            set({ 
              catalogs: { 
                ...state.catalogs,
                default: {
                  products: products || initialProducts,
                  business: business || initialBusiness,
                  isReadOnly: true
                }
              },
              activeId: 'default',
              clientId: null,
              loading: false 
            });
          } else {
            // For client catalogs, load from catalogs API (client-specific)
            const catalogSlug = slug || clientId;
            
            // Try to get client data by ID
            let client = null;
            try {
              // If clientId is numeric, fetch by ID
              if (!isNaN(clientId)) {
                client = await clientsApi.getOne(parseInt(clientId));
              }
            } catch (err) {
              console.warn('Could not load client by ID:', err);
            }
            
            // Load client's catalog entries (products they've added)
            let catalogProducts = [];
            if (client && client.id) {
              try {
                const catalogEntries = await catalogsApi.getByClientId(client.id);
                // Transform catalog entries to products format
                catalogProducts = catalogEntries.map(entry => ({
                  id: entry.product.id,
                  nombre: entry.product.nombre,
                  precio: entry.customPrice || entry.product.precio,
                  description: entry.product.description,
                  ruta: entry.product.ruta,
                  stock: entry.product.stock,
                  category: entry.product.category,
                  catalogId: entry.id, // Store catalog entry ID for deletions
                  active: entry.active
                }));
              } catch (err) {
                console.error('Error loading catalog entries:', err);
              }
            }
            
            const businessData = client ? {
              nombre: client.nombre,
              logo: client.logo,
              color: client.color,
              telefono: client.telefono,
              direccion: client.direccion,
              descripcion: client.descripcion
            } : { ...initialBusiness, nombre: 'Mi Negocio' };
            
            set({ 
              catalogs: { 
                ...state.catalogs,
                [catalogSlug]: {
                  products: catalogProducts,
                  business: businessData,
                  isReadOnly: false
                }
              },
              activeId: catalogSlug,
              clientId: client?.id || null,
              loading: false 
            });
          }
        } catch (error) {
          console.error('Error loading catalog:', error);
          set({ loading: false, error: error.message });
          
          // Fallback: create empty catalog for non-default
          if (!isDefaultCatalog(clientId)) {
            const catalogSlug = slug || clientId;
            set({ 
              catalogs: { 
                ...state.catalogs,
                [catalogSlug]: {
                  products: [],
                  business: { ...initialBusiness, nombre: 'Mi Negocio' },
                  isReadOnly: false
                }
              },
              activeId: catalogSlug,
              clientId: null
            });
          }
        }
      },

      // Initialize a new client catalog
      initializeClientCatalog: async (slug, businessName) => {
        const state = get();
        try {
          set({ loading: true, error: null });
          
          // Create client in backend
          const client = await clientsApi.create({
            nombre: businessName,
            logo: initialBusiness.logo,
            color: initialBusiness.color,
            telefono: initialBusiness.telefono,
            userId: 1 // TODO: Replace with actual authenticated user ID
          });
          
          // Create empty catalog entry in state
          set({ 
            catalogs: { 
              ...state.catalogs,
              [slug]: {
                products: [],
                business: {
                  nombre: client.nombre,
                  logo: client.logo,
                  color: client.color,
                  telefono: client.telefono
                },
                isReadOnly: false
              }
            },
            activeId: slug,
            clientId: client.id,
            loading: false 
          });
          
          return client;
        } catch (error) {
          console.error('Error initializing client catalog:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      clearStorage: () => {
        set({ 
          activeId: 'default',
          clientId: null,
          catalogs: { 
            default: { 
              products: initialProducts, 
              business: initialBusiness,
              isReadOnly: true 
            } 
          },
          loading: false,
          error: null
        });
      },

      // Protegemos al setear activeId: si no existe, forzamos default
      setActiveCatalogId: (id) => {
        const state = get();
        if (!id || !state.catalogs[id]) {
          // resetea a default si el id no existe
          set({ activeId: 'default' });
        } else {
          set({ activeId: id });
        }
      },

      // getActiveCatalog: devuelve catálogo válido o fuerza default si hay inconsistencia
      getActiveCatalog: () => {
        const { activeId, catalogs } = get();
        if (!catalogs) return { products: initialProducts, business: initialBusiness, isReadOnly: true };
        if (!catalogs[activeId]) {
          // corregimos la inconsistencia guardada
          set({ activeId: 'default', clientId: null });
          return catalogs.default || { products: initialProducts, business: initialBusiness, isReadOnly: true };
        }
        return catalogs[activeId];
      },

      // Check if current catalog is read-only (default catalog)
      isReadOnly: () => {
        const active = get().getActiveCatalog();
        return active.isReadOnly === true;
      },

      // Add product (with backend sync)
      addProduct: async (product) => {
        const state = get();
        const activeId = state.activeId;
        let clientId = state.clientId;
        const active = state.getActiveCatalog();
        
        // Prevent modifications to default catalog
        if (active.isReadOnly) {
          set({ error: 'No se puede modificar el catálogo por defecto' });
          throw new Error('No se puede modificar el catálogo por defecto');
        }
        
        // Try to get clientId from localStorage if not in state
        if (!clientId) {
          const storedClientId = localStorage.getItem('clientId');
          if (storedClientId) {
            clientId = parseInt(storedClientId);
            set({ clientId }); // Update state with the clientId
          }
        }
        
        if (!clientId) {
          set({ error: 'No hay cliente activo para agregar productos' });
          throw new Error('No hay cliente activo');
        }
        
        try {
          set({ loading: true, error: null });
          
          // First, create the product in the master catalog
          const newProduct = await productsApi.create(product);
          
          // Then, add it to this client's catalog
          const catalogEntry = await catalogsApi.create({
            clientId: clientId,
            productId: newProduct.id,
            active: true,
            customPrice: product.precio // Use the price as custom price
          });
          
          // Update local state with the new product
          const productWithCatalogId = {
            ...newProduct,
            catalogId: catalogEntry.id
          };
          
          active.products = [...active.products, productWithCatalogId];
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error adding product:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },
      
      // Update product (with backend sync)
      updateProduct: async (id, updated) => {
        const state = get();
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        
        // Prevent modifications to default catalog
        if (active.isReadOnly) {
          set({ error: 'No se puede modificar el catálogo por defecto' });
          throw new Error('No se puede modificar el catálogo por defecto');
        }
        
        try {
          set({ loading: true, error: null });
          
          // Update the product in master catalog
          await productsApi.update(id, updated);
          
          // If there's a custom price, update the catalog entry
          const product = active.products.find(p => p.id === id);
          if (product && product.catalogId && updated.precio) {
            await catalogsApi.update(product.catalogId, {
              customPrice: updated.precio
            });
          }
          
          // Update local state
          active.products = active.products.map(p => p.id === id ? { ...p, ...updated } : p);
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error updating product:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Delete product (with backend sync)
      deleteProduct: async (id) => {
        const state = get();
        const activeId = state.activeId;
        const active = state.getActiveCatalog();
        
        // Prevent modifications to default catalog
        if (active.isReadOnly) {
          set({ error: 'No se puede modificar el catálogo por defecto' });
          throw new Error('No se puede modificar el catálogo por defecto');
        }
        
        try {
          set({ loading: true, error: null });
          
          // Find the product to get its catalogId
          const product = active.products.find(p => p.id === id);
          
          if (product && product.catalogId) {
            // Delete from catalog (not from master products)
            await catalogsApi.delete(product.catalogId);
          } else {
            console.warn('Product does not have catalogId, skipping backend delete');
          }
          
          // Update local state
          active.products = active.products.filter(p => p.id !== id);
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error deleting product:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Update business (with backend sync)
      updateBusiness: async (updates) => {
        const state = get();
        const activeId = state.activeId;
        let clientId = state.clientId;
        const active = state.getActiveCatalog();
        
        // Prevent modifications to default catalog
        if (active.isReadOnly) {
          set({ error: 'No se puede modificar el catálogo por defecto' });
          throw new Error('No se puede modificar el catálogo por defecto');
        }
        
        // Try to get clientId from localStorage if not in state
        if (!clientId) {
          const storedClientId = localStorage.getItem('clientId');
          if (storedClientId) {
            clientId = parseInt(storedClientId);
            set({ clientId }); // Update state with the clientId
          }
        }
        
        if (!clientId) {
          set({ error: 'No hay cliente activo para actualizar' });
          throw new Error('No hay cliente activo');
        }
        
        try {
          set({ loading: true, error: null });
          
          // Update client info in backend
          const updatedClient = await clientsApi.update(clientId, updates);
          
          // Update local state
          active.business = {
            nombre: updatedClient.nombre,
            logo: updatedClient.logo,
            color: updatedClient.color,
            telefono: updatedClient.telefono,
            direccion: updatedClient.direccion,
            descripcion: updatedClient.descripcion
          };
          const newCatalogs = { ...state.catalogs, [activeId]: active };
          set({ catalogs: newCatalogs, loading: false });
        } catch (error) {
          console.error('Error updating business:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      filterProducts: (query) => {
        const active = get().getActiveCatalog();
        return query ? active.products.filter(p => p.nombre.toLowerCase().includes(query.toLowerCase())) :
          active.products;
      },

      getTotalProducts: () => get().getActiveCatalog().products.length,
      getTotalStock: () => get().getActiveCatalog().products.reduce((sum, p) => sum + (p.stock || 0), 0),

      saveAll: async () => {
        const state = get();
        const active = state.getActiveCatalog();
        
        // Prevent modifications to default catalog
        if (active.isReadOnly) {
          return { success: false, message: 'No se puede modificar el catálogo por defecto' };
        }
        
        try {
          set({ loading: true, error: null });
          
          // All changes are already saved via individual operations
          // This is just a confirmation action
          set({ loading: false });
          return { success: true, message: 'Todos los cambios guardados correctamente' };
        } catch (error) {
          console.error('Error saving:', error);
          set({ loading: false, error: error.message });
          return { success: false, message: 'Error al guardar: ' + error.message };
        }
      },
    })
);
