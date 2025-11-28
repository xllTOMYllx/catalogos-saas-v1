import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { AlertTriangle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicStoreHeader from '../components/PublicStoreHeader';
import { clientsApi } from '../api/clients';

/**
 * PublicStoreLayout - Layout para tiendas públicas
 * 
 * Incluye el PublicStoreHeader que muestra datos de la tienda pública.
 * Se usa para: /tienda/:slug y /tienda/:slug/carrito
 * No requiere autenticación.
 */
export default function PublicStoreLayout() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    const fetchPublicStore = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch public store data (only returns if isStorePublic is true)
        const client = await clientsApi.getPublicStore(slug);
        
        setStoreData({
          id: client.id,
          nombre: client.nombre,
          logo: client.logo,
          color: client.color || '#f24427',
          telefono: client.telefono,
          direccion: client.direccion,
          descripcion: client.descripcion,
          slug: client.slug,
        });
      } catch (err) {
        console.error('Error fetching public store:', err);
        if (err.response?.status === 404) {
          setError('notfound');
        } else {
          setError('error');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPublicStore();
    }
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#080c0e] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f24427] mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  // Store not found or not public
  if (error === 'notfound') {
    return (
      <div className="bg-[#080c0e] min-h-screen flex flex-col">
        <header className="fixed w-full top-0 z-[100] bg-[#030506] border-b border-gray-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src="/logosinfondo.png" alt="Logo" className="w-8 h-8 mr-2" />
              <span className="text-white font-semibold">Catálogos SaaS</span>
            </Link>
            <Link 
              to="/login-role" 
              className="px-4 py-2 bg-[#f24427] text-white rounded-lg font-semibold hover:bg-[#d6331a] transition"
            >
              Crear mi tienda
            </Link>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center px-4">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Tienda no disponible</h1>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              La tienda "<span className="text-white">{slug}</span>" no existe o no está disponible públicamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Ir al inicio
              </Link>
              <Link 
                to="/login-role" 
                className="px-6 py-3 bg-[#f24427] text-white rounded-lg font-semibold hover:bg-[#d6331a] transition flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                Crear mi tienda
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Generic error
  if (error === 'error') {
    return (
      <div className="bg-[#080c0e] min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Error al cargar la tienda</h1>
          <p className="text-gray-400 mb-6">Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[#f24427] text-white rounded-lg font-semibold hover:bg-[#d6331a] transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <PublicStoreHeader businessData={storeData} catalogSlug={slug} />
      <Outlet context={{ storeData, slug }} />
    </div>
  );
}
