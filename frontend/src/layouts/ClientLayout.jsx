import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ClientHeader from '../components/ClientHeader';
import { useAdminStore } from '../store/adminStore';

/**
 * ClientLayout - Layout para el espacio personalizado de clientes
 * 
 * Incluye el ClientHeader que solo muestra elementos relacionados al catálogo del cliente.
 * NO incluye navegación a la landing page (INICIO, NOSOTROS, CONTACTO).
 * La única forma de salir de este espacio es cerrando sesión.
 * 
 * Se usa para: /:catalogSlug y /:catalogSlug/admin
 */
export default function ClientLayout() {
  const { catalogSlug } = useParams();
  const { loadCatalog, activeId, loading } = useAdminStore();
  
  // Load the client's catalog when the layout mounts
  // This ensures the header has the correct data from the start
  useEffect(() => {
    // Only load catalog if:
    // 1. We have a catalog slug that's not the default
    // 2. The currently active catalog doesn't match our slug (need to load)
    // 3. We're not already loading (prevent duplicate requests)
    const shouldLoadCatalog = 
      catalogSlug && 
      catalogSlug !== 'default' && 
      activeId !== catalogSlug && 
      !loading;
    
    if (shouldLoadCatalog) {
      const storedClientId = localStorage.getItem('clientId');
      const storedSlug = localStorage.getItem('userId');
      
      // If the slug matches our stored slug, use the stored clientId
      if (storedSlug === catalogSlug && storedClientId) {
        const parsedClientId = parseInt(storedClientId, 10);
        if (!isNaN(parsedClientId) && parsedClientId > 0) {
          loadCatalog(parsedClientId, catalogSlug);
        }
      }
    }
  }, [catalogSlug, loadCatalog, activeId, loading]);
  
  return (
    <>
      <ClientHeader catalogSlug={catalogSlug} />
      <Outlet />
    </>
  );
}
