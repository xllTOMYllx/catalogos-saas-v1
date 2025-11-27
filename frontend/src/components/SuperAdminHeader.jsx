import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useAdminStore } from '../store/adminStore';
import toast from 'react-hot-toast';
import { LogOut, Shield } from 'lucide-react';

/**
 * SuperAdminHeader - Header for super administrator panel
 * 
 * Contains only the logo (UrbanStreet default), admin indicator, and logout button.
 * This is used exclusively for the super admin management panel.
 */
export default function SuperAdminHeader() {
  const { logout } = useAuth();
  const { clearStorage, setActiveCatalogId } = useAdminStore();
  const navigate = useNavigate();

  // Default business data for UrbanStreet (the main company)
  const businessData = {
    nombre: 'UrbanStreet',
    logo: '/logosinfondo.png',
  };

  const handleLogout = async () => {
    try {
      if (logout && typeof logout === 'function') {
        await logout();
      }
      clearStorage();
      setActiveCatalogId('default');
      toast.success('Sesión cerrada. ¡Hasta pronto!', { duration: 2000 });
      navigate('/');
    } catch (err) {
      console.error('Error during logout:', err);
      clearStorage();
      setActiveCatalogId('default');
      navigate('/');
    }
  };

  return (
    <header className="fixed w-full top-0 z-[100] bg-[#030506] border-b border-gray-800 px-2 sm:px-4 lg:px-6 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center flex-shrink-0">
          <button onClick={() => navigate('/super-admin')} className="flex items-center">
            <img 
              src={businessData.logo} 
              alt={`${businessData.nombre} Logo`} 
              className="w-8 h-8 sm:w-10 sm:h-10 mr-2 rounded" 
            />
            <h1 className="font-serif text-white font-semibold text-lg sm:text-xl truncate">
              {businessData.nombre}
            </h1>
          </button>
          
          {/* Admin Badge */}
          <div className="ml-3 flex items-center gap-1 bg-[#f24427] px-2 py-1 rounded-md">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-semibold">SUPER ADMIN</span>
          </div>
        </div>

        {/* Right Section - Logout */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
