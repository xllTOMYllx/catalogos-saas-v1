import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, PhoneIcon, Menu, X } from 'lucide-react';  // npm install lucide-react si no tienes
import { useCartStore } from '../store/cartStore';

export default function Header({ negocio = { nombre: 'UrbanStreet', logo: 'https://via.placeholder.com/48x48/030506/ffffff?text=US', telefono: '1234567890', color: '#f24427' } }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, getTotal } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);  // Suma cantidades reales

  const handleWhatsApp = () => {
    const message = `¡Hola! Mi pedido de ${negocio.nombre}: ${items.map(i => `${i.nombre} x${i.quantity || 1} - $${i.precio}`).join('\n')} Total: $${getTotal()}`;
    const url = `https://wa.me/${negocio.telefono}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsMobileMenuOpen(false);  // Cierra menú al clic
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-[#030506] border-b border-gray-800 px-2 sm:px-4 lg:px-6 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img src={negocio.logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 mr-2" />
          <h1 className="font-serif text-white font-semibold text-lg sm:text-xl truncate">{negocio.nombre}</h1>
        </div>

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-white">
          <Link to="/" className="hover:text-[#f24427] transition-colors">INICIO</Link>
          <Link to="/colecciones" className="hover:text-[#f24427] transition-colors">COLECCIONES</Link>
          <Link to="/nosotros" className="hover:text-[#f24427] transition-colors">SOBRE NOSOTROS</Link>
          <Link to="/contacto" className="hover:text-[#f24427] transition-colors">CONTACTO</Link>
          <Link to="/admin" className="bg-[#f24427] hover:bg-[#d6331a] px-4 py-2 rounded-md text-sm font-semibold transition-colors">ADMIN</Link>
        </nav>

        {/* Acciones Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="border border-gray-600 rounded-full flex bg-[#121516] p-1 max-w-xs">
            <input type="text" placeholder="Buscar..." className="bg-transparent text-white px-3 py-1 outline-none w-full text-sm" />
            <svg className="w-4 h-4 text-white ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
          <button className="p-2 text-white hover:bg-[#f24427] rounded-full relative">
            <ShoppingCartIcon className="w-5 h-5" />
            {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">{totalItems}</span>}
          </button>
          <button onClick={handleWhatsApp} className="p-2 text-white hover:bg-green-500 rounded-full">
            <PhoneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Hamburguesa Móvil */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-[#f24427] rounded-md"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Nav Móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#030506] border-t border-gray-800 px-4 py-4 space-y-4">
          <nav className="space-y-2">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-white hover:text-[#f24427] transition-colors">INICIO</Link>
            <Link to="/colecciones" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-white hover:text-[#f24427] transition-colors">COLECCIONES</Link>
            <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-white hover:text-[#f24427] transition-colors">SOBRE NOSOTROS</Link>
            <Link to="/contacto" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-white hover:text-[#f24427] transition-colors">CONTACTO</Link>
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 bg-[#f24427] hover:bg-[#d6331a] text-center rounded-md font-semibold">ADMIN</Link>
          </nav>
          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-600">
            <button className="p-2 text-white hover:bg-[#f24427] rounded-full">
              <ShoppingCartIcon className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-3 w-3 flex items-center justify-center ml-4">{totalItems}</span>}
            </button>
            <button onClick={handleWhatsApp} className="p-2 text-white hover:bg-green-500 rounded-full">
              <PhoneIcon className="w-5 h-5" />
            </button>
          </div>
          {/* Search Móvil Simple */}
          <div className="border border-gray-600 rounded-full flex bg-[#121516] p-1 mt-4">
            <input type="text" placeholder="Buscar..." className="bg-transparent text-white px-3 py-1 outline-none flex-1 text-sm" />
          </div>
        </div>
      )}
    </header>
  );
}
