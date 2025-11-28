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
  const { getActiveCatalog, filterProducts, setActiveCatalogId, activeId, clearStorage } = useAdminStore();
  // ahora también tomamos `user` desde useAuth
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  // total seguro y formateador
  const total = typeof getTotal === 'function' ? getTotal() : 0;
  const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

  // Get business data from active catalog or use defaultNegocio prop as fallback
  const activeCatalog = getActiveCatalog();
  const businessData = defaultNegocio || activeCatalog?.business || { nombre: 'UrbanStreet', logo: '/logosinfondo.png', telefono: '1234567890' };

  // Determinar slug actual (primer segmento) y si es ruta catálogo (evitar static pages)
  const parts = location.pathname.split('/').filter(Boolean);
  const first = parts[0] || '';
  const staticSegments = ['admin', 'nosotros', 'contacto', 'colecciones', 'login', 'login-role', 'cart', 'checkout'];
  const currentCatalogSlug = first && !staticSegments.includes(first) ? first : null;

  // Detectar si estamos en la landing page o en la página de demo
  // En estas páginas ocultamos elementos de catálogo/tienda (búsqueda, carrito, colecciones, WhatsApp, LogoPortal)
  const isLandingPage = location.pathname === '/';
  const isDemoPage = location.pathname === '/demo';
  
  // Páginas públicas informativas donde usuarios anónimos solo ven navegación simplificada
  const isPublicInfoPage = ['/nosotros', '/contacto'].includes(location.pathname);
  
  // Páginas de autenticación donde mostramos navbar simplificado
  const isAuthPage = ['/login-role', '/login', '/forgot-password', '/reset-password'].includes(location.pathname);
  
  // El navbar simplificado se muestra en:
  // 1. Landing page y Demo page (siempre)
  // 2. Páginas públicas informativas cuando el usuario NO está autenticado
  // 3. Páginas de autenticación (login-role, login, forgot-password, reset-password)
  const isSimplifiedNavbar = isLandingPage || isDemoPage || (isPublicInfoPage && !isAuthenticated) || isAuthPage;

  // Rol y sesión (más robusto)
  const storedRoleRaw = typeof window !== 'undefined' ? (localStorage.getItem('role') || '') : '';
  const storedRole = storedRoleRaw.toLowerCase().trim();
  const isAdminRole = storedRole === 'admin';
  const isClienteRole = ['cliente', 'client', 'customer'].includes(storedRole);

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
      
      // Reemplazar el historial para prevenir acceso con botón atrás
      window.history.replaceState(null, '', '/');
      navigate('/', { replace: true });
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Error during logout:', err);
      clearStorage();
      setActiveCatalogId('default');
      window.history.replaceState(null, '', '/');
      navigate('/', { replace: true });
      setIsMobileMenuOpen(false);
    }
  };

  // Mostrar ADMIN: admin siempre; cliente sólo cuando slug coincide con activeId (comparación en string)
  const showAdminButton = isAdminRole || (isClienteRole && currentCatalogSlug && String(currentCatalogSlug) === String(activeId));

  // Helper para marcar "Inicio" activo (opcional)
  const isHome = location.pathname === '/';

  // Debug info (retirar en producción)
  useEffect(() => {
    console.debug('[Header debug] isAuthenticated:', isAuthenticated, 'storedRole:', storedRole, 'isAdminRole:', isAdminRole, 'isClienteRole:', isClienteRole, 'currentCatalogSlug:', currentCatalogSlug, 'activeId:', activeId, 'showAdminButton:', showAdminButton);
  }, [isAuthenticated, storedRole, isAdminRole, isClienteRole, currentCatalogSlug, activeId, showAdminButton]);

  return (
    <>
      <header className="fixed w-full top-0 z-[100] bg-[#030506] border-b border-gray-800 px-2 sm:px-4 lg:px-6 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center flex-shrink-0 relative">
            <button onClick={handleHomeNavigation} className="flex items-center">
              <img src={businessData.logo} alt={`${businessData.nombre} Logo`} className="w-8 h-8 sm:w-10 sm:h-10 mr-2 rounded" />
              <h1 className="font-serif text-white font-semibold text-lg sm:text-xl truncate">{businessData.nombre}</h1>
            </button>
            {/* Hide LogoPortal on landing page and demo page */}
            {!isSimplifiedNavbar && <LogoPortal onSwitch={handleCatalogSwitch} />}
          </div>

          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-white text-sm">
            <button onClick={handleHomeNavigation} className={`hover:text-[#f24427] transition-colors whitespace-nowrap ${isHome ? 'text-[#f24427]' : ''}`}>INICIO</button>

            {/* Hide COLECCIONES on landing page and demo page */}
            {!isSimplifiedNavbar && (
              <NavLink
                to="/colecciones"
                className={({ isActive }) => (isActive ? 'text-[#f24427] transition-colors whitespace-nowrap' : 'hover:text-[#f24427] transition-colors whitespace-nowrap')}
                onClick={handleColecciones}
              >
                COLECCIONES
              </NavLink>
            )}

            <NavLink
              to="/nosotros"
              className={({ isActive }) => (isActive ? 'text-[#f24427] transition-colors whitespace-nowrap' : 'hover:text-[#f24427] transition-colors whitespace-nowrap')}
            >
              NOSOTROS
            </NavLink>

            <NavLink
              to="/contacto"
              className={({ isActive }) => (isActive ? 'text-[#f24427] transition-colors whitespace-nowrap' : 'hover:text-[#f24427] transition-colors whitespace-nowrap')}
            >
              CONTACTO
            </NavLink>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {showAdminButton && (
                  <button onClick={() => { navigate(currentCatalogSlug ? `/${currentCatalogSlug}/admin` : '/admin'); setIsMobileMenuOpen(false); }} className="bg-[#f24427] hover:bg-[#d6331a] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap">
                    ADMIN
                  </button>
                )}
                <button onClick={handleLogout} className="bg-gray-500 hover:bg-gray-600 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap">
                  SALIR
                </button>
              </div>
            ) : (
              <button onClick={() => { navigate('/login-role'); setIsMobileMenuOpen(false); }} className="bg-[#f24427] hover:bg-[#d6331a] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap">
                ENTRAR
              </button>
            )}
          </nav>

          {/* Desktop action buttons - hide search, cart, and WhatsApp on landing/demo pages */}
          <div className="hidden md:flex items-center gap-4">
            {/* Form de búsqueda (escritorio) - hidden on landing/demo */}
            {!isSimplifiedNavbar && (
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
            )}

            {/* Subscription badge: se muestra sólo si hay user */}
            {user && (
              <div className="hidden sm:flex items-center">
                <SubscriptionBadge userId={user?.id} />
              </div>
            )}

            {/* Cart button - hidden on landing/demo */}
            {!isSimplifiedNavbar && (
              <button onClick={() => setShowCartModal(true)} className="relative p-2 text-white hover:bg-[#f24427] rounded-full">
                <ShoppingCartIcon className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">{totalItems}</span>}
              </button>
            )}

            {/* WhatsApp button - hidden on landing/demo */}
            {!isSimplifiedNavbar && (
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
            )}
          </div>

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
        
        {/* Mobile menu: premium dark gradient + glass effect */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed left-3 right-3 top-[68px] z-[60] rounded-xl bg-gradient-to-br from-[#0a0e10]/95 via-[#121516]/90 to-[#080c0e]/95 backdrop-blur-md border border-gray-800 shadow-2xl px-4 py-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Mobile header inside menu: logo + nombre + close */}
            <div className="flex items-center justify-between">
              <button onClick={handleHomeNavigation} className="flex items-center gap-3">
                <img src={businessData.logo} alt={`${businessData.nombre} Logo`} className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10" />
                <div className="text-left">
                  <div className="text-white font-semibold text-base leading-tight truncate">{businessData.nombre}</div>
                  <div className="text-white/60 text-xs">Catálogo digital</div>
                </div>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 text-white rounded-md hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2 divide-y divide-gray-800/40">
              <div className="py-2 space-y-1">
                <button onClick={handleHomeNavigation} className="block w-full text-left py-3 px-2 rounded-md text-white/95 hover:text-[#f24427] transition-colors">INICIO</button>

                {/* Hide COLECCIONES on landing/demo pages */}
                {!isSimplifiedNavbar && (
                  <NavLink
                    to="/colecciones"
                    onClick={() => { handleColecciones(); setIsMobileMenuOpen(false); }}
                    className={({ isActive }) => isActive ? 'block py-3 px-2 text-[#f24427] font-semibold' : 'block py-3 px-2 text-white/90 hover:text-[#f24427]'}
                  >
                    COLECCIONES
                  </NavLink>
                )}

                <NavLink
                  to="/nosotros"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => isActive ? 'block py-3 px-2 text-[#f24427] font-semibold' : 'block py-3 px-2 text-white/90 hover:text-[#f24427]'}
                >
                  SOBRE NOSOTROS
                </NavLink>

                <NavLink
                  to="/contacto"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => isActive ? 'block py-3 px-2 text-[#f24427] font-semibold' : 'block py-3 px-2 text-white/90 hover:text-[#f24427]'}
                >
                  CONTACTO
                </NavLink>
              </div>

              <div className="py-3 space-y-2">
                {user && <div className="py-1"><SubscriptionBadge userId={user?.id} /></div>}

                {isAuthenticated ? (
                  <>
                    {showAdminButton && (
                      <button onClick={() => { navigate(currentCatalogSlug ? `/${currentCatalogSlug}/admin` : '/admin'); setIsMobileMenuOpen(false); }}
                        className="w-full py-3 bg-gradient-to-r from-[#f24427] to-[#d6331a] text-white rounded-lg font-semibold shadow-sm hover:scale-[1.01] transition transform"
                      >
                        ADMIN
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full py-3 bg-white/6 text-white rounded-lg font-semibold hover:bg-white/10 transition">
                      CERRAR SESIÓN
                    </button>
                  </>
                ) : (
                  <button onClick={() => { navigate('/login-role'); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-[#f24427] to-[#d6331a] text-white rounded-lg font-semibold shadow-sm">
                    INICIAR SESIÓN
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile menu footer - hide cart, WhatsApp, and search on landing/demo pages */}
            {!isSimplifiedNavbar && (
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
                      msg = `¡Hola! Me interesa información sobre los catálogos de ${businessData.nombre}. ¿Me pueden ayudar, por favor?`;
                    }
                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                    window.open(url, '_blank');
                  }} className="p-2 bg-white/6 text-white rounded-full hover:bg-green-600/80 transition">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} className="flex-1 ml-3 min-w-0">
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
            )}
          </div>
        )}
      </header>

      {/* Cart preview modal -> ahora usa componente separado para mantener el header limpio */}
      {showCartModal && <CartPreview onClose={() => setShowCartModal(false)} />}
    </>
  );
}