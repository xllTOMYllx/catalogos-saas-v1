import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Shield, Zap } from 'lucide-react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useAdminStore } from '../store/adminStore';

function LandingPage() {
  const { catalogs } = useAdminStore();
  // Always show default catalog on landing page, regardless of logged-in state
  const defaultCatalog = catalogs?.default || { products: [], business: { nombre: 'UrbanStreet', logo: '/logosinfondo.png', color: '#f24427' } };
  const activeProducts = defaultCatalog.products || [];
  
  // Mostrar solo los primeros 4 productos como preview
  const previewProducts = activeProducts.slice(0, 4);

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <Header negocio={defaultCatalog.business} />
      
      <main className="flex-1 pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0a0e10] via-[#121516] to-[#080c0e] py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#f24427] rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Tu Catálogo Digital
                <span className="block text-[#f24427] mt-2">Siempre Disponible</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Crea y gestiona tu catálogo de productos en línea. Comparte con tus clientes y vende sin límites.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/colecciones" 
                  className="bg-[#f24427] hover:bg-[#d6331a] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                  Ver Catálogo Completo
                </Link>
                <Link 
                  to="/login-role" 
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-[#080c0e] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 w-full sm:w-auto"
                >
                  Crear Mi Catálogo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-[#121516]">
          <div className="container mx-auto px-4 sm:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-[#171819] p-6 rounded-xl text-center hover:shadow-xl transition-shadow">
                <div className="bg-[#f24427] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fácil de Usar</h3>
                <p className="text-gray-400 text-sm">
                  Interfaz intuitiva para agregar y gestionar tus productos en minutos.
                </p>
              </div>
              
              <div className="bg-[#171819] p-6 rounded-xl text-center hover:shadow-xl transition-shadow">
                <div className="bg-[#f24427] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Comparte Fácilmente</h3>
                <p className="text-gray-400 text-sm">
                  Comparte tu catálogo por WhatsApp, redes sociales o cualquier canal.
                </p>
              </div>
              
              <div className="bg-[#171819] p-6 rounded-xl text-center hover:shadow-xl transition-shadow">
                <div className="bg-[#f24427] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Seguro y Confiable</h3>
                <p className="text-gray-400 text-sm">
                  Tus datos están protegidos con las mejores prácticas de seguridad.
                </p>
              </div>
              
              <div className="bg-[#171819] p-6 rounded-xl text-center hover:shadow-xl transition-shadow">
                <div className="bg-[#f24427] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Actualización Instantánea</h3>
                <p className="text-gray-400 text-sm">
                  Actualiza precios y stock en tiempo real para todos tus clientes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Preview Section */}
        {previewProducts.length > 0 && (
          <section className="py-16 bg-[#080c0e]">
            <div className="container mx-auto px-4 sm:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Productos Destacados
                </h2>
                <p className="text-gray-400 text-lg">
                  Descubre algunos de nuestros productos más populares
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center mb-8">
                {previewProducts.map(producto => (
                  <ProductCard
                    key={producto.id || producto.nombre}
                    id={producto.id || Math.random()}
                    ruta={producto.ruta || 'https://via.placeholder.com/300x400/171819/f24427?text=Producto'}
                    nombre={producto.nombre}
                    precio={producto.precio}
                    description={producto.description || 'Descripción temporal'}
                    stock={producto.stock || 10}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <Link 
                  to="/colecciones" 
                  className="inline-block bg-[#f24427] hover:bg-[#d6331a] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                >
                  Ver Todos los Productos →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#f24427] to-[#d6331a]">
          <div className="container mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              ¿Listo para crear tu catálogo?
            </h2>
            <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
              Únete a cientos de negocios que ya están vendiendo en línea con nuestra plataforma.
            </p>
            <Link 
              to="/login-role" 
              className="inline-block bg-white text-[#f24427] px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:bg-gray-100"
            >
              Comenzar Ahora - Es Gratis
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#030506] border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 sm:px-8 text-center text-gray-400">
          <p>&copy; 2025 {defaultCatalog.business?.nombre || 'UrbanStreet'}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
