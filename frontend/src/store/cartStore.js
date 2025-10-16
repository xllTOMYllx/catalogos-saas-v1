import { create } from 'zustand';

// Función principal: Crea el store con estados y acciones
export const useCartStore = create((set, get) => ({
  // Estado inicial: Array vacío de items
  items: [],

  // Acción: Agregar un producto al carrito (si ya existe, suma cantidad)
  addItem: (product) => set((state) => {
    const existing = state.items.find(item => item.id === product.id);
    if (existing) {
      return {
        items: state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
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

  // Getter: Calcula total (no cambia estado, solo lee)
  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}));