import CategoriesCard from "../components/CategoriesCard";
import ProductCard from "../components/ProductCard";
import { useAdminStore } from '../store/adminStore';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { catalogsApi } from '../api/catalogs';
import { ShoppingBag, Phone, MapPin } from 'lucide-react';
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
  const location = useLocation();
  const { loadCatalog, getActiveCatalog, filterProducts, setActiveCatalogId } = useAdminStore();

  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  
  // State for all products across all catalogs (for /colecciones route)
  const [allCatalogProducts, setAllCatalogProducts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  // Determine if we're on the public collections page
  const isPublicCollections = location.pathname === '/colecciones';

  // Load all catalog products for public collections view
  useEffect(() => {
    if (isPublicCollections) {
      const fetchAllProducts = async () => {
        try {
          setLoadingAll(true);
          // Fetch recent or all products based on toggle
          const products = showRecentOnly 
            ? await catalogsApi.getRecentProducts() 
            : await catalogsApi.getAllProducts();
          setAllCatalogProducts(products);
        } catch (error) {
          console.error('Error loading all catalog products:', error);
          setAllCatalogProducts([]);
        } finally {
          setLoadingAll(false);
        }
      };
      fetchAllProducts();
    }
  }, [isPublicCollections, showRecentOnly]);

  // Load catalog when component mounts or slug changes (for specific catalog routes)
  useEffect(() => {
    if (!isPublicCollections) {
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
    }
  }, [incoming, loadCatalog, isPublicCollections]);
  
  // Mantener behavior actual del store si quieres filtrar allí también
  useEffect(() => {
    if (!isPublicCollections) {
      if (typeof setActiveCatalogId === 'function') setActiveCatalogId('default');
      // opcional: mantener filterProducts para sincronizar store
      if (typeof filterProducts === 'function') filterProducts(q);
    }
  }, [q, filterProducts, setActiveCatalogId, isPublicCollections]);

  const activeCatalog = getActiveCatalog();

  // Computa filteredProducts en memoria, soportando búsqueda por múltiples tokens.
  const filteredProducts = useMemo(() => {
    const activeProducts = isPublicCollections ? allCatalogProducts : (activeCatalog.products || []);
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
  }, [isPublicCollections, allCatalogProducts, activeCatalog.products, q]);

  // Handler to toggle between recent and all products
  const handleShowRecentCollections = () => {
    setShowRecentOnly(!showRecentOnly);
  };

  // Get business data for client catalog view
  const businessData = activeCatalog?.business || {
    nombre: 'Mi Tienda',
    logo: '/logosinfondo.png',
    color: '#f24427',
    telefono: '',
    descripcion: '',
    direccion: ''
  };

  return (
    <div className="bg-[#080c0e] min-h-screen flex flex-col">
      <main className="flex-1 pt-16 sm:pt-20 overflow-x-hidden">
        {/* Business Header - Solo para catálogos de cliente (no para /colecciones) */}
        {!isPublicCollections && (
          <section 
            className="py-8 sm:py-12 relative"
            style={{ 
              background: `linear-gradient(135deg, ${businessData.color || '#f24427'}20 0%, #080c0e 100%)`
            }}
          >
            <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Logo */}
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center overflow-hidden border-4 flex-shrink-0"
                  style={{ borderColor: businessData.color || '#f24427' }}
                >
                  {businessData.logo ? (
                    <img 
                      src={businessData.logo} 
                      alt={businessData.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" aria-label="Logo de tienda" />
                  )}
                </div>

                {/* Business Info */}
                <div className="text-center md:text-left flex-1">
                  <h1 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                    style={{ color: businessData.color || '#f24427' }}
                  >
                    {businessData.nombre || 'Mi Tienda'}
                  </h1>
                  {businessData.descripcion && (
                    <p className="text-gray-300 text-base sm:text-lg mb-4 max-w-2xl">
                      {businessData.descripcion}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-400 text-sm">
                    {businessData.telefono && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {businessData.telefono}
                      </span>
                    )}
                    {businessData.direccion && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {businessData.direccion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-2 sm:px-4 md:px-8 py-6 max-w-7xl">
          {/* CategoriesCard solo para vista de colecciones públicas */}
          {isPublicCollections && (
            <CategoriesCard 
              ruta={cap1Placeholder} 
              onButtonClick={handleShowRecentCollections}
              btnText={showRecentOnly ? "Ver todas las colecciones" : "Ver nuevas colecciones"}
            />
          )}
          
          <section className={isPublicCollections ? "mt-6 sm:mt-8" : ""}>
            {/* Products Section Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-2">
              <h2 
                className="text-2xl sm:text-3xl font-bold text-center sm:text-left"
                style={{ color: isPublicCollections ? '#f24427' : (businessData.color || '#f24427') }}
              >
                {isPublicCollections ? 'Todas las Colecciones' : 'Productos del Catálogo'}
              </h2>
              {!isPublicCollections && (
                <span className="text-gray-400 text-sm">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {q ? (
              <div className="text-center mb-4">
                <p className="text-gray-300 text-sm">Resultados para: <strong className="text-white">{q}</strong></p>
              </div>
            ) : null}

            {loadingAll ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
                <p className="text-gray-400 text-lg">No se encontraron productos{q ? ` para "${q}"` : '.'}</p>
                <p className="text-gray-500 text-sm mt-2">Intenta con otros términos o revisa la ortografía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
                {filteredProducts.map((producto, index) => (
                  <ProductCard
                    key={producto.id ? `${producto.id}-${producto.catalogId || producto.clientId || index}` : `product-${index}`}
                    id={producto.id || index}
                    ruta={producto.ruta || producto.image || 'https://via.placeholder.com/300x400/171819/f24427?text=Producto'}
                    nombre={producto.nombre}
                    precio={producto.precio}
                    description={producto.description || producto.descripcion || 'Descripción temporal'}
                    stock={producto.stock || 10}
                    clientName={isPublicCollections ? producto.clientName : null}
                    clientColor={isPublicCollections ? producto.clientColor : null}
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