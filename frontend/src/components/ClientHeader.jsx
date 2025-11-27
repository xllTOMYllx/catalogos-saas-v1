import { useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, PhoneIcon, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/useAuth';
import { useAdminStore } from '../store/adminStore';
import toast from 'react-hot-toast';
import CartPreview from '../components/CartPreview';
import SubscriptionBadge from '../components/SubscriptionBadge';

/**
 * ClientHeader - Header específico para el espacio personalizado de clientes
 * 
 * Este header se muestra únicamente en las rutas de catálogo de cliente (/:catalogSlug y /:catalogSlug/admin)
 * No contiene enlaces a la landing page (INICIO, NOSOTROS, CONTACTO) ya que el cliente
 * tiene su propio espacio personalizado. La única forma de salir es cerrando sesión.
 */
export default function ClientHeader({ catalogSlug }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);

  const { items, getTotal } = useCartStore();
  const { getActiveCatalog, filterProducts, setActiveCatalogId, activeId, clearStorage } = useAdminStore();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const total = typeof getTotal === 'function' ? getTotal() : 0;
  const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

  // Get business data from active catalog
  const activeCatalog = getActiveCatalog();
  const businessData = activeCatalog?.business || { nombre: 'Mi Catálogo', logo: '/logosinfondo.png', telefono: '1234567890' };

  // Determinar si estamos en la página de admin del catálogo
  const isAdminPage = location.pathname.includes('/admin');

  // Rol y sesión
  const storedRoleRaw = typeof window !== 'undefined' ? (localStorage.getItem('role') || '') : '';
  const storedRole = storedRoleRaw.toLowerCase().trim();
  const isAdminRole = storedRole === 'admin';
  const isClienteRole = ['cliente', 'client', 'customer'].includes(storedRole);

  // Mostrar botón ADMIN solo si el usuario tiene permisos
  const showAdminButton = isAdminRole || (isClienteRole && catalogSlug && String(catalogSlug) === String(activeId));

  // Search en vivo
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (typeof filterProducts === 'function') filterProducts(query);
  };

  // Navegar al catálogo del cliente
  const handleCatalogNavigation = () => {
    if (catalogSlug) {
      navigate(`/${catalogSlug}`);
    }
    setIsMobileMenuOpen(false);
  };

  // Navegar al admin del catálogo
  const handleAdminNavigation = () => {
    if (catalogSlug) {
      navigate(`/${catalogSlug}/admin`);
    }
    setIsMobileMenuOpen(false);
  };

  // Logout: limpiar session y regresar a landing page
  const handleLogout = async () => {
    try {
      if (logout && typeof logout === 'function') {
        await logout();
      }
      clearStorage();
      setActiveCatalogId('default');
      toast.success('Sesión cerrada. ¡Hasta pronto!', { duration: 2000 });
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Error during logout:', err);
      clearStorage();
      setActiveCatalogId('default');
      navigate('/');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="fixed w-full top-0 z-[100] bg-[#030506] border-b border-gray-800 px-2 sm:px-4 lg:px-6 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo y nombre del negocio */}
          <div className="flex items-center flex-shrink-0">
            <button onClick={handleCatalogNavigation} className="flex items-center">
              <img src={businessData.logo} alt={`${businessData.nombre} Logo`} className="w-8 h-8 sm:w-10 sm:h-10 mr-2 rounded" />
              <h1 className="font-serif text-white font-semibold text-lg sm:text-xl truncate">{businessData.nombre}</h1>
            </button>
          </div>

          {/* Desktop Navigation - Solo elementos del catálogo del cliente */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-white text-sm">
            <button 
              onClick={handleCatalogNavigation} 
              className={`hover:text-[#f24427] transition-colors whitespace-nowrap ${!isAdminPage ? 'text-[#f24427]' : ''}`}
            >
              MI CATÁLOGO
            </button>

            {isAuthenticated && showAdminButton && (
              <button 
                onClick={handleAdminNavigation} 
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${isAdminPage ? 'bg-[#f24427]' : 'bg-gray-600 hover:bg-[#f24427]'}`}
              >
                ADMIN
              </button>
            )}
            <button 
              onClick={handleLogout} 
              className="bg-gray-500 hover:bg-gray-600 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap"
            >
              SALIR
            </button>
          </nav>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Form de búsqueda */}
            <form onSubmit={(e) => { e.preventDefault(); }} className="border border-gray-600 rounded-full flex bg-[#121516] p-1 max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar productos..."
                className="bg-transparent text-white px-3 py-1 outline-none w-full text-sm"
                onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
              />
              <button type="submit" className="px-3 text-gray-200 hover:text-white">🔎</button>
            </form>

            {/* Subscription badge */}
            {user && (
              <div className="hidden sm:flex items-center">
                <SubscriptionBadge userId={user?.id} />
              </div>
            )}

            {/* Cart button */}
            <button onClick={() => setShowCartModal(true)} className="relative p-2 text-white hover:bg-[#f24427] rounded-full">
              <ShoppingCartIcon className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">{totalItems}</span>}
            </button>

            {/* WhatsApp button */}
            <button onClick={() => {
              const phone = String(businessData.telefono || businessData.phone || '1234567890').replace(/\D/g, '');
              let msg;
              if (items && items.length > 0) {
                msg = `¡Hola! Mi pedido de ${businessData.nombre}: ${items.map(i => {
                  const name = i.nombre ?? i.name ?? 'Producto';
                  const qty = i.quantity ?? 1;
                  const priceNum = Number(i.price ?? i.precio ?? 0) || 0;
                  return `${name} x${qty} - ${fmt(priceNum)}`;
                }).join('\n')} Total: ${fmt(total)}`;
              } else {
                msg = `¡Hola! Me interesa información sobre los productos de ${businessData.nombre}. ¿Me pueden ayudar?`;
              }
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
              window.open(url, '_blank');
            }} className="p-2 text-white hover:bg-green-500 rounded-full">
              <PhoneIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white hover:bg-[#f24427] rounded-md">
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
              <button onClick={handleCatalogNavigation} className="flex items-center gap-3">
                <img src={businessData.logo} alt={`${businessData.nombre} Logo`} className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10" />
                <div className="text-left">
                  <div className="text-white font-semibold text-base leading-tight truncate">{businessData.nombre}</div>
                  <div className="text-white/60 text-xs">Tu catálogo digital</div>
                </div>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 text-white rounded-md hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2 divide-y divide-gray-800/40">
              <div className="py-2 space-y-1">
                <button 
                  onClick={handleCatalogNavigation} 
                  className={`block w-full text-left py-3 px-2 rounded-md transition-colors ${!isAdminPage ? 'text-[#f24427] font-semibold' : 'text-white/95 hover:text-[#f24427]'}`}
                >
                  MI CATÁLOGO
                </button>
              </div>

              <div className="py-3 space-y-2">
                {user && <div className="py-1"><SubscriptionBadge userId={user?.id} /></div>}

                {showAdminButton && (
                  <button 
                    onClick={handleAdminNavigation}
                    className={`w-full py-3 rounded-lg font-semibold shadow-sm transition transform ${isAdminPage ? 'bg-[#f24427] text-white' : 'bg-gradient-to-r from-[#f24427] to-[#d6331a] text-white hover:scale-[1.01]'}`}
                  >
                    ADMIN
                  </button>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="w-full py-3 bg-white/6 text-white rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  SALIR
                </button>
              </div>
            </nav>

            {/* Mobile menu footer with cart, WhatsApp, and search */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800/40">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowCartModal(true)} className="relative p-2 bg-white/6 text-white rounded-full hover:bg-white/10 transition">
                  <ShoppingCartIcon className="w-5 h-5" />
                  {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center text-white">{totalItems}</span>}
                </button>

                <button onClick={() => {
                  const phone = String(businessData.telefono || businessData.phone || '1234567890').replace(/\D/g, '');
                  let msg;
                  if (items && items.length > 0) {
                    msg = `¡Hola! Mi pedido de ${businessData.nombre}: ${items.map(i => {
                      const name = i.nombre ?? i.name ?? 'Producto';
                      const qty = i.quantity ?? 1;
                      const priceNum = Number(i.price ?? i.precio ?? 0) || 0;
                      return `${name} x${qty} - ${fmt(priceNum)}`;
                    }).join('\n')} Total: ${fmt(total)}`;
                  } else {
                    msg = `¡Hola! Me interesa información sobre los productos de ${businessData.nombre}. ¿Me pueden ayudar?`;
                  }
                  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                  window.open(url, '_blank');
                }} className="p-2 bg-white/6 text-white rounded-full hover:bg-green-600/80 transition">
                  <PhoneIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); }} className="flex-1 ml-3 min-w-0">
                <div className="flex items-center bg-[#0f1314] rounded-full border border-gray-700 px-2 py-1 min-w-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Buscar..."
                    className="bg-transparent text-white px-3 py-1 outline-none flex-1 text-sm min-w-0 truncate"
                    onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
                  />
                  <button type="submit" className="px-3 text-white/90 flex-shrink-0">🔎</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Cart preview modal */}
      {showCartModal && <CartPreview onClose={() => setShowCartModal(false)} />}
    </>
  );
}
