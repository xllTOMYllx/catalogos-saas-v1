// Header.jsx
import { useState } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, PhoneIcon, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../hooks/useAuth';
import { useAdminStore } from '../store/adminStore';
import LogoPortal from '../components/LogoPortal';
import toast from 'react-hot-toast';

export default function Header({ negocio: defaultNegocio }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);

  const { items, getTotal } = useCartStore();
  const { business, filterProducts, setActiveCatalogId, activeId, clearStorage } = useAdminStore();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
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

  // Search y colecciones
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts(query);
  };

  const handleColecciones = () => {
    filterProducts('');
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
  const handleLogout = () => {
    if (logout && typeof logout === 'function') {
      try { logout(); } catch { /* ignore */ }
    }
    try {
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('admin-storage'); // key del persist en adminStore
    } catch { /* ignore */ }
    try { 
      clearStorage(); 
      setActiveCatalogId('default'); // Reset to default catalog
    } catch { /* ignore */ }

    toast.success('Sesión cerrada. ¡Hasta pronto!', { duration: 2000 });
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Mostrar Admin si es admin OR si es cliente y visita su catálogo (activeId === slug)
  const showAdminButton = isAdminRole || (isClienteRole && currentCatalogSlug && currentCatalogSlug === activeId);

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
            <button onClick={handleHomeNavigation} className="hover:text-[#f24427] transition-colors">INICIO</button>
            <Link to="/colecciones" className="hover:text-[#f24427] transition-colors" onClick={handleColecciones}>COLECCIONES</Link>
            <Link to="/nosotros" className="hover:text-[#f24427] transition-colors">SOBRE NOSOTROS</Link>
            <Link to="/contacto" className="hover:text-[#f24427] transition-colors">CONTACTO</Link>

            {/* Si hay sesión: mostrar CERRAR SESIÓN; si no, INICIAR SESIÓN */}
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

          <div className="hidden md:flex items-center gap-4">
            <div className="border border-gray-600 rounded-full flex bg-[#121516] p-1 max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar productos..."
                className="bg-transparent text-white px-3 py-1 outline-none w-full text-sm"
                onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
              />
              <svg className="w-4 h-4 text-white ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>

            <button onClick={() => setShowCartModal(true)} className="relative p-2 text-white hover:bg-[#f24427] rounded-full">
              <ShoppingCartIcon className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">{totalItems}</span>}
            </button>

            <button onClick={() => {
              const msg = `¡Hola! Mi pedido de ${businessData.nombre}: ${items.map(i => `${i.nombre} x${i.quantity || 1} - $${i.precio}`).join('\n')} Total: $${getTotal()}`;
              const url = `https://wa.me/${businessData.telefono || '1234567890'}?text=${encodeURIComponent(msg)}`;
              window.open(url, '_blank');
            }} className="p-2 text-white hover:bg-green-500 rounded-full">
              <PhoneIcon className="w-5 h-5" />
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white hover:bg-[#f24427] rounded-md">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#030506] border-t border-gray-800 px-4 py-4 space-y-4">
            <nav className="space-y-2">
              <button onClick={handleHomeNavigation} className="block py-2 hover:text-[#f24427] w-full text-left">INICIO</button>
              <Link to="/colecciones" onClick={() => { handleColecciones(); setIsMobileMenuOpen(false); }} className="block py-2 hover:text-[#f24427]">COLECCIONES</Link>
              <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-[#f24427]">SOBRE NOSOTROS</Link>
              <Link to="/contacto" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-[#f24427]">CONTACTO</Link>

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
                const msg = `¡Hola! Mi pedido de ${businessData.nombre}: ${items.map(i => `${i.nombre} x${i.quantity || 1} - $${i.precio}`).join('\n')} Total: $${getTotal()}`;
                const url = `https://wa.me/${businessData.telefono || '1234567890'}?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
              }} className="p-2 text-white hover:bg-green-500 rounded-full">
                <PhoneIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-gray-600 rounded-full flex bg-[#121516] p-1 mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar..."
                className="bg-transparent text-white px-3 py-1 outline-none flex-1 text-sm"
                onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
              />
            </div>
          </div>
        )}
      </header>

      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121516] p-6 rounded-lg w-full max-w-md max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Carrito ({totalItems} items)</h3>
            <ul className="space-y-2 mb-4">
              {items.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.nombre} x{item.quantity || 1}</span>
                  <span>${item.precio * (item.quantity || 1)}</span>
                </li>
              ))}
            </ul>
            <div className="text-lg font-bold mb-4">Total: ${getTotal()}</div>
            <div className="flex gap-2">
              <button onClick={() => setShowCartModal(false)} className="flex-1 bg-gray-500 text-white py-2 rounded">Cerrar</button>
              <button onClick={() => {
                const message = `¡Hola! Mi pedido de ${businessData.nombre}: ${items.map(i => `${i.nombre} x${i.quantity || 1} - $${i.precio}`).join('\n')} Total: $${getTotal()}`;
                const url = `https://wa.me/${businessData.telefono || '1234567890'}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
                setShowCartModal(false);
              }} className="flex-1 bg-green-500 text-white py-2 rounded">Enviar por WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}