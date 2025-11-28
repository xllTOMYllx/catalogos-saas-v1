import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAdminStore } from '../store/adminStore';

/**
 * CartPreview - Modal compacto usado en el Header cuando el usuario pulsa el icono del carrito.
 * Usa la API de tu store (updateQuantity, removeItem, getTotal).
 * Navega al carrito correcto según el contexto (cliente vs público).
 * 
 * @param {Object} props
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.businessData - Datos del negocio (opcional, usado en tiendas públicas)
 */
export default function CartPreview({ onClose, businessData: propBusinessData }) {
  const { items = [], getTotal, updateQuantity, removeItem } = useCartStore();
  const { getActiveCatalog } = useAdminStore();
  const location = useLocation();
  
  // Use prop businessData if provided (for public stores), otherwise fall back to adminStore
  const activeCatalog = getActiveCatalog();
  const storeBusinessData = activeCatalog?.business || {};
  const businessData = propBusinessData || storeBusinessData;
  const businessPhone = businessData.telefono || businessData.phone || '';
  const businessName = businessData.nombre || 'Tienda';

  const total = typeof getTotal === 'function' ? getTotal() : 0;

  const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

  // Detectar si estamos en un catálogo de cliente o tienda pública
  const pathParts = location.pathname.split('/').filter(Boolean);
  const staticSegments = ['admin', 'nosotros', 'contacto', 'colecciones', 'login', 'login-role', 'cart', 'checkout', 'carrito', 'subscription-plans', 'demo', 'forgot-password', 'reset-password', 'tienda'];
  
  // Check if we're in a public store route (/tienda/:slug)
  const isPublicStore = pathParts[0] === 'tienda' && pathParts[1];
  const catalogSlug = isPublicStore 
    ? null  // Public stores don't have catalog-based cart routes
    : (pathParts[0] && !staticSegments.includes(pathParts[0]) ? pathParts[0] : null);
  
  // Determinar la ruta del carrito según el contexto
  // For public stores, we stay on the same store page (no separate cart route)
  const carritoLink = catalogSlug ? `/${catalogSlug}/carrito` : '/carrito';

  const changeQty = (id, qty) => {
    const next = Math.max(1, Number(qty) || 1);
    if (typeof updateQuantity === 'function') updateQuantity(id, next);
  };

  const handleRemove = (id) => {
    if (typeof removeItem === 'function') removeItem(id);
  };

  const handleClear = () => {
    if (confirm('¿Vaciar carrito?')) {
      // Zustand hook exposes setState on the hook object
      if (typeof useCartStore.setState === 'function') {
        useCartStore.setState({ items: [] });
      }
    }
  };

  const handleWhatsApp = () => {
    // Validate that cart has items before sending
    if (!items || items.length === 0) {
      alert('Debes agregar productos al carrito antes de enviar tu pedido.');
      return;
    }
    
    // Validate that we have a phone number
    const phone = String(businessPhone).replace(/\D/g, '');
    if (!phone) {
      alert('No hay número de contacto disponible para esta tienda.');
      return;
    }
    
    const msg = `¡Hola! Mi pedido de ${businessName}: ${items.map(i => {
      const name = i.nombre ?? i.name ?? 'Producto';
      const qty = i.quantity ?? 1;
      const price = i.price ?? i.precio ?? 0;
      return `${name} x${qty} - $${(price).toFixed(2)}`;
    }).join(', ')} Total: $${Number(total).toFixed(2)}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[110] flex items-start justify-end p-4 pt-20">
      <div className="w-full max-w-md bg-[#0b0e10] rounded-lg shadow-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Carrito ({items.length})</h3>
          <div className="flex items-center gap-2">
            <button
              title="Vaciar carrito"
              onClick={handleClear}
              className="text-sm text-gray-300 hover:text-red-400"
            >
              Vaciar
            </button>
            <button onClick={onClose} aria-label="Cerrar" className="p-1 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Tu carrito está vacío.</div>
          ) : (
            items.map(item => {
              const name = item.nombre ?? item.name ?? 'Producto';
              const qty = item.quantity ?? 1;
              const price = item.price ?? item.precio ?? 0;
              const lineTotal = (price * qty) || 0;
              const img = item.ruta ?? item.image ?? 'https://via.placeholder.com/80x80';

              return (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-800 last:border-b-0">
                  <img src={img} alt={name} className="w-16 h-16 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white truncate">{name}</p>
                      <p className="text-sm font-medium text-gray-200">{formatCurrency(lineTotal)}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-[#121516] rounded-full px-2 py-1 border border-gray-800">
                        <button
                          onClick={() => changeQty(item.id, qty - 1)}
                          className="p-1 text-gray-300 hover:text-white"
                          aria-label={`Disminuir cantidad de ${name}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <input
                          type="number"
                          value={qty}
                          min="1"
                          onChange={(e) => changeQty(item.id, e.target.value)}
                          className="w-12 bg-transparent text-center text-white outline-none text-sm"
                        />

                        <button
                          onClick={() => changeQty(item.id, qty + 1)}
                          className="p-1 text-gray-300 hover:text-white"
                          aria-label={`Aumentar cantidad de ${name}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        title="Eliminar"
                        className="p-2 text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#060809]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">Subtotal</span>
            <span className="text-lg font-semibold text-white">{formatCurrency(total)}</span>
          </div>

          <div className="flex gap-2">
            <Link to={carritoLink} onClick={onClose} className="flex-1 text-center bg-transparent border border-gray-700 text-white py-2 rounded-md">
              Ver carrito completo
            </Link>
            <button onClick={handleWhatsApp} className="flex-1 bg-[#f24427] text-white py-2 rounded-md font-semibold">
              Enviar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}