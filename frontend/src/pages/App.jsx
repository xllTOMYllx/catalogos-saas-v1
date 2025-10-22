import Header from "../components/Header";
import CategoriesCard from "../components/CategoriesCard";
import ProductCard from "../components/ProductCard";
//import { products as initialProducts } from "../database/products";  // Named import inicial
import { useAdminStore } from '../store/adminStore';  // ✅ Store dinámico
import { useEffect } from 'react';
import { useParams } from "react-router-dom";
// Placeholder para cap1 si no tienes imagen local
import cap1Placeholder from '../assets/images/cap1.png';

function App() {
  const {id} = useParams(); // Obtener id de la URL
  const {setActiveCatalogId, filterProducts, getActiveCatalog} = useAdminStore();
  const activeCatalog = getActiveCatalog();
  const activeProducts = activeCatalog.products;
  

  useEffect(() => {
    if (id) {
      setActiveCatalogId(id);  // Switch a ID de URL
    }
    filterProducts('');  // Limpia filtro
  }, [id, setActiveCatalogId, filterProducts]);

  //const cap1Placeholder = 'https://via.placeholder.com/400x250/121516/ffffff?text=Coleccion+Urban';


  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <Header negocio={activeCatalog.business} />  // ✅ Business scopado
      <main className="flex-1 pt-16 sm:pt-20 overflow-x-hidden">
        <div className="container mx-auto px-2 sm:px-4 md:px-8 py-6 max-w-7xl">
          <CategoriesCard ruta={cap1Placeholder} />
          <section className="mt-6 sm:mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center" style={{ color: activeCatalog.business.color }}>
              Catálogo de {activeCatalog.business.nombre}
            </h2>
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
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;