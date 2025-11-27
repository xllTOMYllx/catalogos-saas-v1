import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

/**
 * MainLayout - Layout para las páginas principales de la plataforma
 * 
 * Incluye el Header principal con navegación a landing page (INICIO, NOSOTROS, CONTACTO)
 * Se usa para: Landing Page, Demo, Colecciones públicas, páginas de info, login, etc.
 */
export default function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
