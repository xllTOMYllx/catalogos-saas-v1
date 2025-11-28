import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Shield, Zap, Check, Star, ArrowRight } from 'lucide-react';

function LandingPage() {
  // Planes con sus características
  const plans = [
    {
      name: 'GRATIS',
      price: '$0',
      period: '/mes',
      description: 'Perfecto para empezar',
      features: ['1 catálogo', 'Hasta 20 productos', 'Soporte comunitario', 'Personalización básica'],
      highlighted: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'BÁSICO',
      price: '$299',
      period: '/mes',
      description: 'Para pequeños negocios',
      features: ['3 catálogos', 'Hasta 100 productos', 'Soporte por email', 'Personalización avanzada', 'Análisis básico'],
      highlighted: false,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'PRO',
      price: '$799',
      period: '/mes',
      description: 'Para negocios en crecimiento',
      features: ['10 catálogos', 'Productos ilimitados', 'Soporte prioritario', 'Personalización completa', 'Acceso API'],
      highlighted: true,
      color: 'from-[#f24427] to-[#d6331a]'
    },
    {
      name: 'EMPRESA',
      price: '$1,999',
      period: '/mes',
      description: 'Todo incluido',
      features: ['Catálogos ilimitados', 'Productos ilimitados', 'Soporte dedicado', 'White label', 'API completa'],
      highlighted: false,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      
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
                <span className="block text-[#f24427] mt-2">Profesional y Personalizado</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Crea tu catálogo online con tu propio slug personalizado, logo, colores y todos tus productos. 
                Comparte tu tienda con un link único y profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/demo" 
                  className="bg-[#f24427] hover:bg-[#d6331a] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  Ver Demo del Catálogo
                </Link>
                <Link 
                  to="/login-role" 
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-[#080c0e] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  Crear Mi Catálogo
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-[#0a0e10]">
          <div className="container mx-auto px-4 sm:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              En solo 3 pasos tendrás tu catálogo digital funcionando
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="bg-[#f24427] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Crea tu Cuenta</h3>
                <p className="text-gray-400">
                  Regístrate con tu nombre, email y datos de tu negocio. Tu URL única se genera automáticamente: <span className="text-[#f24427]">tuapp.com/mi-tienda</span>
                </p>
              </div>
              <div className="text-center">
                <div className="bg-[#f24427] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Personaliza</h3>
                <p className="text-gray-400">
                  Sube tu logo, elige tus colores y agrega toda la información de tu negocio.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-[#f24427] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Agrega Productos</h3>
                <p className="text-gray-400">
                  Sube tus productos con fotos, precios y descripciones. ¡Y listo para vender!
                </p>
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
                <h3 className="text-xl font-semibold text-white mb-2">URL Personalizada</h3>
                <p className="text-gray-400 text-sm">
                  Tu propio slug único para compartir tu catálogo profesionalmente.
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

        {/* Pricing Section */}
        <section className="py-16 bg-[#080c0e]">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Planes y Precios
              </h2>
              <p className="text-gray-400 text-lg">
                Elige el plan que mejor se adapte a tu negocio
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <div 
                  key={index}
                  className={`bg-[#171819] rounded-xl overflow-hidden transition-transform hover:scale-105 ${
                    plan.highlighted ? 'ring-2 ring-[#f24427] shadow-lg shadow-[#f24427]/20' : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="bg-[#f24427] text-white text-center py-1 text-sm font-semibold">
                      ⭐ MÁS POPULAR
                    </div>
                  )}
                  <div className={`bg-gradient-to-r ${plan.color} text-white p-6`}>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="ml-1 text-sm opacity-80">{plan.period}</span>
                    </div>
                    <p className="text-sm mt-2 opacity-90">{plan.description}</p>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-300 text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link 
                      to="/login-role"
                      className={`block w-full text-center py-2 px-4 rounded-lg font-semibold transition-colors ${
                        plan.highlighted 
                          ? 'bg-[#f24427] hover:bg-[#d6331a] text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      Comenzar
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link 
                to="/subscription-plans" 
                className="text-[#f24427] hover:text-[#d6331a] font-medium inline-flex items-center gap-2"
              >
                Ver todos los detalles de los planes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#f24427] to-[#d6331a]">
          <div className="container mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              ¿Listo para crear tu catálogo?
            </h2>
            <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
              Únete a cientos de negocios que ya están vendiendo en línea con nuestra plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/demo" 
                className="inline-block bg-white text-[#f24427] px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:bg-gray-100"
              >
                Ver Demo Primero
              </Link>
              <Link 
                to="/login-role" 
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 hover:bg-white/10"
              >
                Comenzar Ahora - Es Gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#030506] border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 sm:px-8 text-center text-gray-400">
          <p>&copy; 2025 Catálogos SaaS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
