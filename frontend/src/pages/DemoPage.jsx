import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Phone, MapPin, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useAdminStore } from '../store/adminStore';

function DemoPage() {
  const { getActiveCatalog, loadCatalog } = useAdminStore();
  
  // Load default catalog on mount (demo catalog)
  useEffect(() => {
    loadCatalog('default', 'default');
  }, [loadCatalog]);
  
  const demoCatalog = getActiveCatalog();
  const demoProducts = demoCatalog.products || [];
  const demoBusiness = demoCatalog.business || {
    nombre: 'Mi Tienda Demo',
    logo: '/logosinfondo.png',
    color: '#f24427',
    telefono: '1234567890',
    descripcion: 'Esta es una tienda de demostración para mostrar las capacidades de la plataforma.',
    direccion: 'Calle Ejemplo 123, Ciudad'
  };

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <main className="flex-1 pt-16 sm:pt-20">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 text-center">
          <p className="text-sm sm:text-base font-medium flex items-center justify-center gap-2">
            <Star className="w-4 h-4" />
            <span>Este es un catálogo de demostración - </span>
            <Link to="/login-role" className="underline font-bold hover:text-yellow-100">
              ¡Crea el tuyo gratis!
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <div className="container mx-auto px-4 sm:px-8 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {/* Business Header */}
        <section 
          className="py-12 relative"
          style={{ 
            background: `linear-gradient(135deg, ${demoBusiness.color}20 0%, #080c0e 100%)`
          }}
        >
          <div className="container mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Logo */}
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4"
                style={{ borderColor: demoBusiness.color }}
              >
                {demoBusiness.logo ? (
                  <img 
                    src={demoBusiness.logo} 
                    alt={demoBusiness.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Business Info */}
              <div className="text-center md:text-left flex-1">
                <h1 
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  style={{ color: demoBusiness.color }}
                >
                  {demoBusiness.nombre}
                </h1>
                {demoBusiness.descripcion && (
                  <p className="text-gray-300 text-lg mb-4 max-w-2xl">
                    {demoBusiness.descripcion}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-400 text-sm">
                  {demoBusiness.telefono && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {demoBusiness.telefono}
                    </span>
                  )}
                  {demoBusiness.direccion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {demoBusiness.direccion}
                    </span>
                  )}
                </div>
              </div>

              {/* Example URL Badge */}
              <div className="bg-[#171819] rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-xs mb-1">Tu URL personalizada:</p>
                <p className="text-white font-mono text-sm">
                  tuapp.com/<span style={{ color: demoBusiness.color }}>mi-tienda</span>
                </p>
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
                style={{ color: demoBusiness.color }}
              >
                Productos del Catálogo
              </h2>
              <span className="text-gray-400 text-sm">
                {demoProducts.length} productos
              </span>
            </div>

            {demoProducts.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Cargando productos de demostración...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {demoProducts.map((producto, index) => (
                  <ProductCard
                    key={producto.id || index}
                    id={producto.id || index}
                    ruta={producto.ruta || 'https://via.placeholder.com/300x400/171819/f24427?text=Producto'}
                    nombre={producto.nombre}
                    precio={producto.precio}
                    description={producto.description || 'Descripción del producto'}
                    stock={producto.stock || 10}
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
            background: `linear-gradient(90deg, ${demoBusiness.color} 0%, ${demoBusiness.color}cc 100%)`
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
                style={{ color: demoBusiness.color }}
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
          <p>&copy; 2025 Catálogos SaaS. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">
            Este es un catálogo de demostración. 
            <Link to="/login-role" className="text-[#f24427] hover:underline ml-1">
              Crea tu propio catálogo →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DemoPage;
