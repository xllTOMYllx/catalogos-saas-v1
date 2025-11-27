import { Outlet, useParams } from 'react-router-dom';
import ClientHeader from '../components/ClientHeader';

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
  
  return (
    <>
      <ClientHeader catalogSlug={catalogSlug} />
      <Outlet />
    </>
  );
}
