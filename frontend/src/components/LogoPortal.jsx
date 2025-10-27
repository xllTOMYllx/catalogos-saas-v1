import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

function LogoPortal({ onSwitch }) {
  const [isOpen, setIsOpen] = useState(false);
  const role = localStorage.getItem('role') || 'user';
  const dropdownRef = useRef(null);

  // obtenemos catálogos desde el store en tiempo real
  const catalogsFromStore = useAdminStore((s) => s.catalogs);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  // Construimos la lista de catálogos a mostrar (id = clave del objeto catalogs)
  // Exclude 'default' catalog from the list if user is not admin
  const getCatalogList = () => {
    if (!catalogsFromStore) return [];
    return Object.entries(catalogsFromStore)
      .filter(([id]) => {
        // Only show 'default' if user is explicitly viewing it or is admin
        // For clients, only show their own catalogs (non-default)
        if (id === 'default') {
          return role === 'admin' || role === 'user';
        }
        return true;
      })
      .map(([id, value]) => ({
        id,
        name: value.business?.nombre || id
      }));
  };

  const catalogs = getCatalogList();

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button onClick={handleToggle} className="flex items-center gap-1 text-white hover:text-[#f24427] p-1 rounded">
        <ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#121516] rounded-lg shadow-lg z-40 border border-gray-600">
          <h4 className="p-3 font-bold text-gray-300">{role === 'cliente' ? 'Mis Catálogos' : 'Explorar'}</h4>

          {/* Opción para volver a la landing pública */}
          <div className="px-3 pb-2">
            <button
              onClick={() => { onSwitch('home'); setIsOpen(false); }}
              className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm font-medium"
            >
              Inicio / Tienda pública
            </button>
          </div>

          <ul className="py-2">
            {catalogs.map((catalog) => (
              <li key={catalog.id}>
                <button
                  onClick={() => { onSwitch(catalog.id); setIsOpen(false); }}
                  className="w-full text-left p-3 hover:bg-gray-700 rounded text-white text-sm"
                >
                  {catalog.name}
                </button>
              </li>
            ))}
            {catalogs.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No hay catálogos disponibles</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LogoPortal;