import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

/**
 * ProtectedRoute - Componente para proteger rutas que requieren autenticación
 * 
 * Este componente:
 * 1. Verifica si el usuario está autenticado
 * 2. Redirige a login si no está autenticado
 * 3. Previene acceso con el botón de volver atrás del navegador después de cerrar sesión
 * 4. Opcionalmente verifica roles específicos (admin, cliente, etc.)
 * 
 * @param {React.ReactNode} children - Componente hijo a renderizar si está autenticado
 * @param {string} requiredRole - Rol requerido para acceder (opcional: 'admin', 'cliente')
 * @param {string} redirectTo - Ruta a la que redirigir si no está autenticado (default: '/login-role')
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  redirectTo = '/login-role' 
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Referencias para los meta tags para asegurar limpieza correcta
  const metaTagsRef = useRef([]);

  // Prevenir cache del navegador para páginas protegidas
  useEffect(() => {
    // Añadir meta tags para prevenir cache
    const metaCacheControl = document.createElement('meta');
    metaCacheControl.httpEquiv = 'Cache-Control';
    metaCacheControl.content = 'no-cache, no-store, must-revalidate';
    
    const metaPragma = document.createElement('meta');
    metaPragma.httpEquiv = 'Pragma';
    metaPragma.content = 'no-cache';
    
    const metaExpires = document.createElement('meta');
    metaExpires.httpEquiv = 'Expires';
    metaExpires.content = '0';

    document.head.appendChild(metaCacheControl);
    document.head.appendChild(metaPragma);
    document.head.appendChild(metaExpires);
    
    // Guardar referencias para limpieza
    metaTagsRef.current = [metaCacheControl, metaPragma, metaExpires];

    // Cleanup: remover meta tags cuando el componente se desmonta
    return () => {
      metaTagsRef.current.forEach(meta => {
        try {
          if (meta && meta.parentNode) {
            meta.parentNode.removeChild(meta);
          }
        } catch {
          // Ignorar errores si el elemento ya fue removido
        }
      });
      metaTagsRef.current = [];
    };
  }, []);

  // Manejar el botón de volver atrás del navegador
  useEffect(() => {
    if (isAuthenticated) {
      // Reemplazar el historial actual para prevenir volver atrás a páginas de login
      window.history.replaceState(null, '', location.pathname);
      
      // Listener para el evento popstate (botón atrás/adelante)
      const handlePopState = () => {
        // Verificar si aún está autenticado usando el mismo key que AuthContext
        const token = localStorage.getItem('authToken');
        if (!token) {
          // Si no hay token, usar navigate de React Router para redirigir
          navigate(redirectTo, { replace: true });
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isAuthenticated, location.pathname, redirectTo, navigate]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#f24427] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    // Usar replace para que no se pueda volver atrás a la página protegida
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Verificar rol si es requerido
  if (requiredRole) {
    const userRole = user?.role?.toLowerCase().trim();
    const required = requiredRole.toLowerCase().trim();
    
    // Manejar variaciones de rol de cliente
    const clientRoles = ['cliente', 'client', 'customer'];
    const isClientRole = clientRoles.includes(required);
    const userIsClient = clientRoles.includes(userRole);
    
    const hasRequiredRole = isClientRole 
      ? userIsClient 
      : userRole === required;

    if (!hasRequiredRole) {
      // Si no tiene el rol requerido, redirigir a login
      return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
  }

  return children;
}
