import { useState, useEffect } from 'react'; 
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, PhoneIcon, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/useAuth';
import { useAdminStore } from '../store/adminStore';
import LogoPortal from '../components/LogoPortal';
import toast from 'react-hot-toast';
import CartPreview from '../components/CartPreview';
import SubscriptionBadge from '../components/SubscriptionBadge';

export default function Header({ negocio: defaultNegocio }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);

  const { items, getTotal } = useCartStore();
  const { business, filterProducts, setActiveCatalogId, activeId, clearStorage } = useAdminStore();
  // ahora también tomamos `user` desde useAuth
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  // total seguro y formateador
  const total = typeof getTotal === 'function' ? getTotal() : 0;
  const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

  const businessData = defaultNegocio || business || { nombre: 'Tienda', logo: '', telefono: '' };

  // Determinar slug actual (primer segmento) y si es ruta catálogo (evitar static pages)
  const parts = location.pathname.split('/').filter(Boolean);
  const first = parts[0] || '';
  const staticSegments = ['admin', 'nosotros', 'contacto', 'colecciones', 'login', 'login-role', 'cart', 'checkout'];
  const currentCatalogSlug = first && !staticSegments.includes(first) ? first : null;

  // Rol y sesión
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const isAdminRole = storedRole === 'admin';
  const isClienteRole = storedRole === 'cliente';

  // Sincronizar searchQuery si estamos en /colecciones y viene q en la url
  useEffect(() => {
    if (location.pathname === '/colecciones') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setSearchQuery(q);
    }
  }, [location.pathname, location.search]);

  // Search en vivo (mientras escribe)
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (typeof filterProducts === 'function') filterProducts(query);
  };

  // Cuando el usuario envía la búsqueda (Enter o botón)
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const q = (searchQuery || '').trim();
    // Asegurarnos de mostrar el catálogo por defecto
    if (typeof setActiveCatalogId === 'function') setActiveCatalogId('default');
    // Aplicar filtro en el store
    if (typeof filterProducts === 'function') filterProducts(q);
    // Navegar a /colecciones con query param
    navigate(`/colecciones${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setIsMobileMenuOpen(false);
  };

  const handleColecciones = () => {
    if (typeof setActiveCatalogId === 'function') setActiveCatalogId('default');
    if (typeof filterProducts === 'function') filterProducts('');
    setIsMobileMenuOpen(false);
  };

  // Switch catálogo desde portal
  const handleCatalogSwitch = (catalogId) => {
    if (catalogId === 'home') {
      setActiveCatalogId('default');
      navigate('/');
    } else {
      setActiveCatalogId(catalogId);
      navigate(`/${catalogId}`);
    }
    setIsMobileMenuOpen(false);
  };

  // Navigate to home and ensure default catalog is shown
  const handleHomeNavigation = () => {
    setActiveCatalogId('default');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Logout: limpiar session y estado persistente
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

  const showAdminButton = isAdminRole || (isClienteRole && currentCatalogSlug && currentCatalogSlug === activeId);

  // Helper para marcar "Inicio" activo (opcional)
  const isHome = location.pathname === '/';

  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-[#030506] border-b border-gray-800 px-2 sm:px-4 lg:px-6 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center flex-shrink-0 relative">
            <button onClick={handleHomeNavigation} className="flex items-center">
              <img src={businessData.logo} alt={`${businessData.nombre} Logo`} className="w-8 h-8 sm:w-10 sm:h-10 mr-2 rounded" />
              <h1 className="font-serif text-white font-semibold text-lg sm:text-xl truncate">{businessData.nombre}</h1>
            </button>
            <LogoPortal onSwitch={handleCatalogSwitch} />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-white">
            <button onClick={handleHomeNavigation} className={`hover:text-[#f24427] transition-colors ${isHome ? 'text-[#f24427]' : ''}`}>INICIO</button>

            <NavLink
              to="/colecciones"
              className={({ isActive }) => (isActive ? 'text-[#f24427] transition-colors' : 'hover:text-[#f24427] transition-colors')}
              onClick={handleColecciones}
            >
              COLECCIONES
            </NavLink>

            <NavLink
              to="/nosotros"
              className={({ isActive }) => (isActive ? 'text-[#f24427] transition-colors' : 'hover:text-[#f24427] transition-colors')}
            >
              SOBRE NOSOTROS
            </NavLink>

            <NavLink
              to="/contacto"
              className={({ isActive }) => (isActive ? 'text-[#f24427] transition-colors' : 'hover:text-[#f24427] transition-colors')}
            >
              CONTACTO
            </NavLink>

            {isAuthenticated ? (
              <>
                {showAdminButton && (
                  <button onClick={() => { navigate(currentCatalogSlug ? `/${currentCatalogSlug}/admin` : '/admin'); setIsMobileMenuOpen(false); }} className="bg-[#f24427] hover:bg-[#d6331a] px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                    ADMIN
                  </button>
                )}
                <button onClick={handleLogout} className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                  CERRAR SESIÓN
                </button>
              </>
            ) : (
              <button onClick={() => { navigate('/login-role'); setIsMobileMenuOpen(false); }} className="bg-[#f24427] hover:bg-[#d6331a] px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                INICIAR SESIÓN
              </button>
            )}
          </nav>

          {/* ...el resto del header no se modifica (buscador, botones, mobile menu) ... */}
          <div className="hidden md:flex items-center gap-4">
            {/* Form de búsqueda (escritorio) */}
            <form onSubmit={handleSearchSubmit} className="border border-gray-600 rounded-full flex bg-[#121516] p-1 max-w-xs">
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

            {/* Subscription badge: se muestra sólo si hay user */}
            {user && (
              <div className="hidden sm:flex items-center">
                <SubscriptionBadge userId={user?.id} />
              </div>
            )}

            <button onClick={() => setShowCartModal(true)} className="relative p-2 text-white hover:bg-[#f24427] rounded-full">
              <ShoppingCartIcon className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">{totalItems}</span>}
            </button>

            <button onClick={() => {
              // Construye mensaje distinto si hay items o si es contacto general
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
                msg = `¡Hola! Me interesa información sobre los catálogos de ${businessData.nombre}. ¿Me pueden ayudar, por favor?`;
              }
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
              window.open(url, '_blank');
            }} className="p-2 text-white hover:bg-green-500 rounded-full">
              <PhoneIcon className="w-5 h-5" />
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white hover:bg-[#f24427] rounded-md">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu kept as-is to avoid changes in behaviour */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#030506] border-t border-gray-800 px-4 py-4 space-y-4">
            <nav className="space-y-2">
              <button onClick={handleHomeNavigation} className="block py-2 hover:text-[#f24427] w-full text-left">INICIO</button>

              {/* Mobile NavLinks para que se marquen como activos */}
              <NavLink
                to="/colecciones"
                onClick={() => { handleColecciones(); setIsMobileMenuOpen(false); }}
                className={({ isActive }) => isActive ? 'block py-2 text-[#f24427]' : 'block py-2 hover:text-[#f24427]'}
              >
                COLECCIONES
              </NavLink>

              <NavLink
                to="/nosotros"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => isActive ? 'block py-2 text-[#f24427]' : 'block py-2 hover:text-[#f24427]'}
              >
                SOBRE NOSOTROS
              </NavLink>

              <NavLink
                to="/contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => isActive ? 'block py-2 text-[#f24427]' : 'block py-2 hover:text-[#f24427]'}
              >
                CONTACTO
              </NavLink>

              {/* Mostrar SubscriptionBadge también en mobile si hay usuario */}
              {user && (
                <div className="py-2">
                  <SubscriptionBadge userId={user?.id} />
                </div>
              )}

              {isAuthenticated ? (
                <>
                  {showAdminButton && <button onClick={() => { navigate(currentCatalogSlug ? `/${currentCatalogSlug}/admin` : '/admin'); setIsMobileMenuOpen(false); }} className="w-full py-2 bg-[#f24427] rounded text-center font-semibold">ADMIN</button>}
                  <button onClick={handleLogout} className="w-full py-2 bg-gray-500 rounded text-center font-semibold">CERRAR SESIÓN</button>
                </>
              ) : (
                <button onClick={() => { navigate('/login-role'); setIsMobileMenuOpen(false); }} className="w-full py-2 bg-[#f24427] rounded text-center font-semibold">INICIAR SESIÓN</button>
              )}
            </nav>

            <div className="flex justify-center space-x-4 pt-4 border-t border-gray-600">
              <button onClick={() => setShowCartModal(true)} className="p-2 text-white hover:bg-[#f24427] rounded-full relative">
                <ShoppingCartIcon className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-3 w-3 flex items-center justify-center ml-4">{totalItems}</span>}
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
                  msg = `¡Hola! Me interesa información sobre los catálogos de ${businessData.nombre}. ¿Me pueden ayudar, por favor?`;
                }
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
              }} className="p-2 text-white hover:bg-green-500 rounded-full">
                <PhoneIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} className="border border-gray-600 rounded-full flex bg-[#121516] p-1 mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar..."
                className="bg-transparent text-white px-3 py-1 outline-none flex-1 text-sm"
                onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
              />
              <button type="submit" className="px-3 text-gray-200">🔎</button>
            </form>
          </div>
        )}
      </header>

      {/* Cart preview modal -> ahora usa componente separado para mantener el header limpio */}
      {showCartModal && <CartPreview onClose={() => setShowCartModal(false)} />}
    </>
  );
}