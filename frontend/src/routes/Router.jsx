import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ScrollToTop from "../components/ScrollToTop";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LandingPage from "../pages/LandingPage";
import DemoPage from "../pages/DemoPage";
import CatalogPage from "../pages/CatalogPage";
import PublicStorePage from "../pages/PublicStorePage";
import AdminDashboard from "../components/admin/AdminDashboard";
import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import LoginRole from "../components/auth/LoginRole";
import ForgotPassword from "../components/auth/ForgotPassword";
import ResetPassword from "../components/auth/ResetPassword";
import Nosotros from "../pages/Nosotros";
import ClientNosotros from "../pages/ClientNosotros";
import Contacto from "../pages/Contacto";
import Carrito from "../pages/Carrito";
import SubscriptionPlans from "../pages/SubscriptionPlans";
import MainLayout from "../layouts/MainLayout";
import ClientLayout from "../layouts/ClientLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

/**
 * Router principal de la aplicación
 * 
 * Separación de layouts:
 * - MainLayout: Páginas principales con Header estándar (INICIO, NOSOTROS, CONTACTO)
 * - ClientLayout: Espacio personalizado del cliente con ClientHeader (sin navegación a landing)
 * - SuperAdminLayout: Panel de administración del sistema con SuperAdminHeader
 * 
 * Rutas públicas:
 * - /tienda/:slug: Tienda pública accesible sin autenticación (si isStorePublic = true)
 * 
 * Protección de rutas:
 * - ProtectedRoute: Componente que verifica autenticación antes de mostrar contenido sensible
 * - Previene acceso con botón atrás/adelante del navegador después de cerrar sesión
 * 
 * Los clientes con su propio catálogo tienen un espacio aislado donde:
 * - No ven enlaces a la landing page principal
 * - Solo ven su catálogo y panel de administración
 * - La única forma de salir es cerrando sesión
 */
export function Router() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ScrollToTop />
                <Routes>
                    {/* Ruta de Tienda Pública - No requiere autenticación */}
                    {/* Esta ruta debe estar ANTES de las rutas con layouts para evitar conflictos */}
                    <Route path="/tienda/:slug" element={<PublicStorePage />} />

                    {/* Rutas con MainLayout (Header principal con navegación a landing) */}
                    <Route element={<MainLayout />}>
                        {/* Rutas estáticas / landing / info */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/demo" element={<DemoPage />} />
                        <Route path="/colecciones" element={<CatalogPage />} />
                        <Route path="/nosotros" element={<Nosotros />} />
                        <Route path="/contacto" element={<Contacto />} />
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/login-role" element={<LoginRole />} />
                        <Route path="/login" element={<LoginRole />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        
                        {/* Admin genérico (sin slug de catálogo) - PROTEGIDO */}
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        
                        {/* Planes de suscripción */}
                        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                    </Route>

                    {/* Rutas con SuperAdminLayout (Panel de administración del sistema) - PROTEGIDO */}
                    <Route element={<SuperAdminLayout />}>
                        <Route path="/super-admin" element={
                            <ProtectedRoute requiredRole="admin">
                                <SuperAdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Rutas con ClientLayout (Header específico para espacio de cliente) */}
                    {/* Estas rutas tienen su propio header sin navegación a landing page */}
                    <Route element={<ClientLayout />}>
                        {/* Admin del cliente - PROTEGIDO */}
                        <Route path="/:catalogSlug/admin" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/:catalogSlug/nosotros" element={<ClientNosotros />} />
                        <Route path="/:catalogSlug/carrito" element={<Carrito />} />
                        <Route path="/:catalogSlug/subscription-plans" element={
                            <ProtectedRoute>
                                <SubscriptionPlans />
                            </ProtectedRoute>
                        } />
                        <Route path="/:catalogSlug" element={<CatalogPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
