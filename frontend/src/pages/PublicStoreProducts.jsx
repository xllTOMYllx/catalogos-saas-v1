import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ShoppingBag, Phone, MapPin, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { catalogsApi } from '../api/catalogs';

/**
 * PublicStoreProducts - Página de productos para tiendas públicas
 * 
 * Esta página se muestra en la ruta /tienda/:slug
 * Usa los datos de la tienda pública desde el contexto del layout.
 */
function PublicStoreProducts() {
  const { storeData } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const store = storeData || {};

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeData?.id) return;
      
      try {
        setLoading(true);

        // Fetch products from client's catalog
        const catalogEntries = await catalogsApi.getByClientId(storeData.id);
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
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeData?.id]);

  return (
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
                    href={`https://wa.me/${String(store.telefono).replace(/\D/g, '')}`}
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

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f24427] mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
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
    </main>
  );
}

export default PublicStoreProducts;
