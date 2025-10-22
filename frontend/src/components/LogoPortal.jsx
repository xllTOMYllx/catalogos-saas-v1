import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function LogoPortal({ onSwitch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'user');
  const dropdownRef = useRef(null);

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

  // Lista mock por role (expande con clones reales del store)
  const getCatalogList = () => {
    if (role === 'cliente') {
      return [
        { id: 'default', name: 'Template Default' },
        { id: 'my-catalog', name: 'Mi Catálogo Personal' }  // Mock clone
      ];
    }
    return [
      { id: 'default', name: 'Catálogo Principal' },
      { id: 'tienda1', name: 'Tienda Ejemplo 1' },
      { id: 'tienda2', name: 'Tienda Ejemplo 2' }  // Mock para viewer
    ];
  };

  const catalogs = getCatalogList();

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button onClick={handleToggle} className="flex items-center gap-1 text-white hover:text-[#f24427] p-1 rounded">
        <ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#121516] rounded-lg shadow-lg z-40 border border-gray-600">
          <h4 className="p-3 font-bold text-gray-300">{role === 'cliente' ? 'Mis Catálogos' : 'Explorar'}</h4>
          <ul className="py-2">
            {catalogs.map((catalog) => (
              <li key={catalog.id}>
                <button
                  onClick={() => onSwitch(catalog.id)}
                  className="w-full text-left p-3 hover:bg-gray-700 rounded text-white text-sm"
                >
                  {catalog.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LogoPortal;