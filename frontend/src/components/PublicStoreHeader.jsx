import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, PhoneIcon, Menu, X, Star } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import CartPreview from './CartPreview';

/**
 * PublicStoreHeader - Header específico para tiendas públicas
 * 
 * Este header se muestra en la ruta /tienda/:slug para visitantes no autenticados.
 * NO contiene opciones de administración.
 * Enfocado en la experiencia de compra del cliente final.
 */
export default function PublicStoreHeader({ businessData = {}, catalogSlug = '' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const { items, getTotal } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const total = typeof getTotal === 'function' ? getTotal() : 0;
  const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

  // Default business data
  const store = {
    nombre: businessData.nombre || 'Tienda',
    logo: businessData.logo || '/logosinfondo.png',
    telefono: businessData.telefono || '',
    color: businessData.color || '#f24427',
    descripcion: businessData.descripcion || '',
    direccion: businessData.direccion || '',
  };

  // Navegar al inicio de la tienda
  const handleStoreNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  // Contactar por WhatsApp
  const handleContactWhatsApp = () => {
    const phone = String(store.telefono || '').replace(/\D/g, '');
    if (!phone) return;
    const msg = `¡Hola! Estoy visitando la tienda ${store.nombre} y me gustaría más información.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setIsMobileMenuOpen(false);
  };

  // WhatsApp con carrito
  const handleWhatsAppWithCart = () => {
    const phone = String(store.telefono || '').replace(/\D/g, '');
    if (!phone) return;
    
    let msg;
    if (items && items.length > 0) {
      msg = `¡Hola! Mi pedido de ${store.nombre}:\n${items.map(i => {
        const name = i.nombre ?? i.name ?? 'Producto';
        const qty = i.quantity ?? 1;
        const priceNum = Number(i.price ?? i.precio ?? 0) || 0;
        return `• ${name} x${qty} - ${fmt(priceNum)}`;
      }).join('\n')}\n\nTotal: ${fmt(total)}`;
    } else {
      msg = `¡Hola! Me interesa información sobre los productos de ${store.nombre}. ¿Me pueden ayudar?`;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <header className="fixed w-full top-0 z-[100] bg-[#030506] border-b border-gray-800 px-2 sm:px-4 lg:px-6 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo y nombre del negocio */}
          <div className="flex items-center flex-shrink-0">
            <Link to={`/tienda/${catalogSlug}`} className="flex items-center">
              <img 
                src={store.logo} 
                alt={`${store.nombre} Logo`} 
                className="w-8 h-8 sm:w-10 sm:h-10 mr-2 rounded" 
                onError={(e) => { e.target.src = '/logosinfondo.png'; }}
              />
              <h1 
                className="font-serif text-white font-semibold text-lg sm:text-xl truncate"
                style={{ color: store.color }}
              >
                {store.nombre}
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-white text-sm">
            <Link 
              to={`/tienda/${catalogSlug}`}
              className="hover:opacity-80 transition-colors whitespace-nowrap"
              style={{ color: store.color }}
            >
              PRODUCTOS
            </Link>

            {store.telefono && (
              <button 
                onClick={handleContactWhatsApp} 
                className="hover:text-green-400 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <PhoneIcon className="w-4 h-4" />
                CONTACTO
              </button>
            )}

            {/* CTA para crear tu propia tienda */}
            <Link 
              to="/login-role" 
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 flex items-center gap-1"
            >
              <Star className="w-3 h-3" />
              Crea tu tienda
            </Link>
          </nav>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart button */}
            <button 
              onClick={() => setShowCartModal(true)} 
              className="relative p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
              style={{ '--hover-color': store.color }}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center"
                  style={{ backgroundColor: store.color }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* WhatsApp button */}
            {store.telefono && (
              <button 
                onClick={handleWhatsAppWithCart} 
                className="p-2 text-white hover:bg-green-500 rounded-full transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 text-white hover:bg-gray-700 rounded-md"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[55] top-[64px]" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed left-3 right-3 top-[68px] z-[60] rounded-xl bg-gradient-to-br from-[#0a0e10]/95 via-[#121516]/90 to-[#080c0e]/95 backdrop-blur-md border border-gray-800 shadow-2xl px-4 py-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Mobile header inside menu */}
            <div className="flex items-center justify-between">
              <Link to={`/tienda/${catalogSlug}`} className="flex items-center gap-3" onClick={handleStoreNavigation}>
                <img 
                  src={store.logo} 
                  alt={`${store.nombre} Logo`} 
                  className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10"
                  onError={(e) => { e.target.src = '/logosinfondo.png'; }}
                />
                <div className="text-left">
                  <div 
                    className="font-semibold text-base leading-tight truncate"
                    style={{ color: store.color }}
                  >
                    {store.nombre}
                  </div>
                  <div className="text-white/60 text-xs">Tienda en línea</div>
                </div>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 bg-white/5 text-white rounded-md hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2 divide-y divide-gray-800/40">
              <div className="py-2 space-y-1">
                <Link 
                  to={`/tienda/${catalogSlug}`}
                  onClick={handleStoreNavigation}
                  className="block w-full text-left py-3 px-2 rounded-md transition-colors font-semibold"
                  style={{ color: store.color }}
                >
                  PRODUCTOS
                </Link>

                {store.telefono && (
                  <button 
                    onClick={handleContactWhatsApp} 
                    className="block w-full text-left py-3 px-2 rounded-md text-white/95 hover:text-green-400 transition-colors"
                  >
                    CONTACTO
                  </button>
                )}
              </div>

              <div className="py-3 space-y-2">
                {/* CTA para crear tu propia tienda */}
                <Link 
                  to="/login-role"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition"
                >
                  <Star className="w-4 h-4 inline mr-2" />
                  Crea tu propia tienda
                </Link>
              </div>
            </nav>

            {/* Mobile menu footer with cart and WhatsApp */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-800/40">
              <button 
                onClick={() => { setShowCartModal(true); setIsMobileMenuOpen(false); }} 
                className="relative p-3 bg-white/6 text-white rounded-full hover:bg-white/10 transition"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center"
                    style={{ backgroundColor: store.color }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {store.telefono && (
                <button 
                  onClick={handleWhatsAppWithCart} 
                  className="p-3 bg-white/6 text-white rounded-full hover:bg-green-600/80 transition"
                >
                  <PhoneIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart preview modal */}
      {showCartModal && <CartPreview onClose={() => setShowCartModal(false)} />}
    </>
  );
}
