import { create } from 'zustand';

// Normaliza un producto para el store
function normalizeProduct(product) {
  const priceRaw = product.price ?? product.precio ?? product.precio_unit ?? product.unit_price ?? 0;
  const price = Number(priceRaw) || 0;
  const id = product.id ?? product._id ?? `${product.name || product.nombre || Math.random()}`;
  const nombre = product.nombre ?? product.name ?? product.title ?? 'Producto';
  const ruta = product.ruta ?? product.image ?? product.img ?? product.thumbnail ?? '';
  return {
    ...product,
    id,
    nombre,
    price,
    ruta,
  };
}

// Función principal: Crea el store con estados y acciones
export const useCartStore = create((set, get) => ({
  // Estado inicial: Array vacío de items
  items: [],

  // Acción: Agregar un producto al carrito (si ya existe, suma cantidad)
  addItem: (product) => set((state) => {
    const normalized = normalizeProduct(product);
    const existing = state.items.find(item => item.id === normalized.id);
    if (existing) {
      return {
        items: state.items.map(item =>
          item.id === normalized.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        )
      };
    }
    return { items: [...state.items, { ...normalized, quantity: 1 }] };
  }),

  // Acción: Remover un item completo
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),

  // Acción: Cambiar cantidad (para + / -)
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0)  // Remueve si llega a 0
  })),

  // Acción: Vaciar carrito (helper)
  clearCart: () => set({ items: [] }),

  // Getter: Calcula total (no cambia estado, solo lee). Usa price normalizado.
  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const price = Number(item.price ?? item.precio ?? 0) || 0;
      const qty = Number(item.quantity || 0) || 0;
      return sum + (price * qty);
    }, 0);
  }
}));