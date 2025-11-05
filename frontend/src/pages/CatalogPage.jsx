import CategoriesCard from "../components/CategoriesCard";
import ProductCard from "../components/ProductCard";
import { useAdminStore } from '../store/adminStore';
import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import cap1Placeholder from '../assets/images/cap1.png';

function normalizeText(str = '') {
  // Normaliza mayúsculas/minúsculas y elimina acentos para búsquedas más robustas
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
    .toLowerCase();
}

function CatalogPage() {
  // Soporta tanto :id (vieja ruta) como :catalogSlug (nueva)
  const { id, catalogSlug } = useParams();
  const incoming = id || catalogSlug;
  const { loadCatalog, getActiveCatalog, filterProducts, setActiveCatalogId } = useAdminStore();

  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

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
  
  // Mantener behavior actual del store si quieres filtrar allí también
  useEffect(() => {
    if (typeof setActiveCatalogId === 'function') setActiveCatalogId('default');
    // opcional: mantener filterProducts para sincronizar store
    if (typeof filterProducts === 'function') filterProducts(q);
  }, [q, filterProducts, setActiveCatalogId]);

  const activeCatalog = getActiveCatalog();
  const activeProducts = activeCatalog.products || [];

  // Computa filteredProducts en memoria, soportando búsqueda por múltiples tokens.
  const filteredProducts = useMemo(() => {
    const query = String(q || '').trim();
    if (!query) return activeProducts;

    const tokens = query
      .split(/\s+/)
      .map(t => normalizeText(t))
      .filter(Boolean);

    if (tokens.length === 0) return activeProducts;

    return activeProducts.filter(producto => {
      // Campos a considerar: nombre, description, tags, sku, cualquier campo textual
      const nombre = normalizeText(producto.nombre ?? producto.name ?? '');
      const description = normalizeText(producto.description ?? producto.descripcion ?? '');
      const tags = Array.isArray(producto.tags) ? producto.tags.join(' ') : (producto.tags ?? '');
      const tagsNorm = normalizeText(tags);
      const other = normalizeText(producto.ruta ?? producto.sku ?? producto.codigo ?? '');

      const hay = `${nombre} ${description} ${tagsNorm} ${other}`;

      // requerir que todos los tokens aparezcan (AND) — ajusta a OR si prefieres
      return tokens.every(token => hay.includes(token));
    });
  }, [activeProducts, q]);

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <main className="flex-1 pt-16 sm:pt-20 overflow-x-hidden">
        <div className="container mx-auto px-2 sm:px-4 md:px-8 py-6 max-w-7xl">
          <CategoriesCard ruta={cap1Placeholder} />
          <section className="mt-6 sm:mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center" style={{ color: activeCatalog.business?.color || '#f24427' }}>
              Catálogo de {activeCatalog.business?.nombre || 'Tienda'}
            </h2>

            {q ? (
              <div className="text-center mb-4">
                <p className="text-gray-300 text-sm">Resultados para: <strong className="text-white">{q}</strong></p>
              </div>
            ) : null}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No se encontraron productos{q ? ` para "${q}"` : '.'}</p>
                <p className="text-gray-500 text-sm mt-2">Intenta con otros términos o revisa la ortografía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
                {filteredProducts.map(producto => (
                  <ProductCard
                    key={producto.id || producto.nombre}
                    id={producto.id || Math.random()}
                    ruta={producto.ruta || producto.image || 'https://via.placeholder.com/300x400/171819/f24427?text=Producto'}
                    nombre={producto.nombre}
                    precio={producto.precio}
                    description={producto.description || producto.descripcion || 'Descripción temporal'}
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