import Header from "../components/Header";
import CategoriesCard from "../components/CategoriesCard";
import ProductCard from "../components/ProductCard";
import { useAdminStore } from '../store/adminStore';
import { useEffect } from 'react';
import { useParams } from "react-router-dom";
import cap1Placeholder from '../assets/images/cap1.png';

function CatalogPage() {
  // Soporta tanto :id (vieja ruta) como :catalogSlug (nueva)
  const { id, catalogSlug } = useParams();
  const incoming = id || catalogSlug;
  const { loadCatalog, getActiveCatalog } = useAdminStore();
  
  // Load catalog when component mounts or slug changes
  useEffect(() => {
    const slug = incoming || 'default';
    
    // If we have a slug that's not default, try to get clientId from localStorage
    if (slug !== 'default') {
      const storedClientId = localStorage.getItem('clientId');
      const storedSlug = localStorage.getItem('userId');
      
      // If the slug matches our stored slug, use the stored clientId
      if (storedSlug === slug && storedClientId) {
        const parsedClientId = parseInt(storedClientId, 10);
        if (!isNaN(parsedClientId) && parsedClientId > 0) {
          loadCatalog(parsedClientId, slug);
          return;
        }
      }
    }
    
    // Default to loading the default catalog
    loadCatalog('default', 'default');
  }, [incoming, loadCatalog]);
  
  const activeCatalog = getActiveCatalog();
  const activeProducts = activeCatalog.products || [];

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <Header negocio={activeCatalog.business} />
      <main className="flex-1 pt-16 sm:pt-20 overflow-x-hidden">
        <div className="container mx-auto px-2 sm:px-4 md:px-8 py-6 max-w-7xl">
          <CategoriesCard ruta={cap1Placeholder} />
          <section className="mt-6 sm:mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center" style={{ color: activeCatalog.business?.color || '#f24427' }}>
              Catálogo de {activeCatalog.business?.nombre || 'Tienda'}
            </h2>
            {activeProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Este catálogo aún no tiene productos.</p>
                <p className="text-gray-500 text-sm mt-2">Los clientes pueden agregar productos desde su panel de administración.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
                {activeProducts.map(producto => (
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
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default CatalogPage;
