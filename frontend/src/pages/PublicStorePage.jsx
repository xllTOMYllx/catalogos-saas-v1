import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Phone, MapPin, Star, AlertTriangle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import PublicStoreHeader from '../components/PublicStoreHeader';
import { clientsApi } from '../api/clients';
import { catalogsApi } from '../api/catalogs';

/**
 * PublicStorePage - Página de tienda pública accesible sin autenticación
 * 
 * Esta página se muestra en la ruta /tienda/:slug
 * Solo muestra tiendas que tienen isStorePublic = true
 * Incluye un header público sin opciones de administración
 */
function PublicStorePage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchPublicStore = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch public store data (only returns if isStorePublic is true)
        const client = await clientsApi.getPublicStore(slug);
        
        setStoreData({
          nombre: client.nombre,
          logo: client.logo,
          color: client.color || '#f24427',
          telefono: client.telefono,
          direccion: client.direccion,
          descripcion: client.descripcion,
          slug: client.slug,
        });

        // Fetch products from client's catalog
        const catalogEntries = await catalogsApi.getByClientId(client.id);
        const catalogProducts = catalogEntries
          .filter(entry => entry.active)
          .map(entry => ({
            id: entry.product.id,
            nombre: entry.product.nombre,
            precio: entry.customPrice || entry.product.precio,
            description: entry.product.description,
            ruta: entry.product.ruta,
            stock: entry.product.stock,
            category: entry.product.category,
          }));

        setProducts(catalogProducts);
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

  const store = storeData || {};

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <PublicStoreHeader businessData={store} catalogSlug={slug} />

      <main className="flex-1 pt-16 sm:pt-20">
        {/* Public Store Banner */}
        <div 
          className="py-3 px-4 text-center"
          style={{ background: `linear-gradient(90deg, ${store.color} 0%, ${store.color}cc 100%)` }}
        >
          <p className="text-sm sm:text-base font-medium text-white flex items-center justify-center gap-2">
            <Star className="w-4 h-4" />
            <span>¿Te gusta esta tienda? </span>
            <Link to="/login-role" className="underline font-bold hover:text-yellow-100">
              ¡Crea la tuya gratis!
            </Link>
          </p>
        </div>

        {/* Business Header */}
        <section 
          className="py-12 relative"
          style={{ 
            background: `linear-gradient(135deg, ${store.color}20 0%, #080c0e 100%)`
          }}
        >
          <div className="container mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Logo */}
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4"
                style={{ borderColor: store.color }}
              >
                {store.logo ? (
                  <img 
                    src={store.logo} 
                    alt={store.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/logosinfondo.png'; }}
                  />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Business Info */}
              <div className="text-center md:text-left flex-1">
                <h1 
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  style={{ color: store.color }}
                >
                  {store.nombre}
                </h1>
                {store.descripcion && (
                  <p className="text-gray-300 text-lg mb-4 max-w-2xl">
                    {store.descripcion}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-400 text-sm">
                  {store.telefono && (
                    <a 
                      href={`https://wa.me/${store.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {store.telefono}
                    </a>
                  )}
                  {store.direccion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {store.direccion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: store.color }}
              >
                Nuestros Productos
              </h2>
              <span className="text-gray-400 text-sm">
                {products.length} producto{products.length !== 1 ? 's' : ''}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Esta tienda aún no tiene productos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((producto, index) => (
                  <ProductCard
                    key={producto.id || index}
                    id={producto.id || index}
                    ruta={producto.ruta || 'https://via.placeholder.com/300x400/171819/f24427?text=Producto'}
                    nombre={producto.nombre}
                    precio={producto.precio}
                    description={producto.description || 'Descripción del producto'}
                    stock={producto.stock || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-16"
          style={{ 
            background: `linear-gradient(90deg, ${store.color} 0%, ${store.color}cc 100%)`
          }}
        >
          <div className="container mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Te gustó lo que viste?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Crea tu propio catálogo con tu marca, logo y productos. 
              Es gratis para empezar y puedes tenerlo listo en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login-role" 
                className="inline-block bg-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                style={{ color: store.color }}
              >
                Crear Mi Catálogo Gratis
              </Link>
              <Link 
                to="/subscription-plans" 
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 hover:bg-white/10"
              >
                Ver Planes y Precios
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#030506] border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 sm:px-8 text-center text-gray-400">
          <p>&copy; 2025 {store.nombre}. Tienda creada con Catálogos SaaS.</p>
          <p className="text-sm mt-2">
            ¿Quieres tu propia tienda online?
            <Link to="/login-role" className="text-[#f24427] hover:underline ml-1">
              Créala gratis →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PublicStorePage;
