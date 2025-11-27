import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ScrollToTop from "../components/ScrollToTop";
import LandingPage from "../pages/LandingPage";
import DemoPage from "../pages/DemoPage";
import CatalogPage from "../pages/CatalogPage";
import AdminDashboard from "../components/admin/AdminDashboard";
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

/**
 * Router principal de la aplicación
 * 
 * Separación de layouts:
 * - MainLayout: Páginas principales con Header estándar (INICIO, NOSOTROS, CONTACTO)
 * - ClientLayout: Espacio personalizado del cliente con ClientHeader (sin navegación a landing)
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
                        
                        {/* Admin genérico (sin slug de catálogo) */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        
                        {/* Planes de suscripción */}
                        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                    </Route>

                    {/* Rutas con ClientLayout (Header específico para espacio de cliente) */}
                    {/* Estas rutas tienen su propio header sin navegación a landing page */}
                    <Route element={<ClientLayout />}>
                        <Route path="/:catalogSlug/admin" element={<AdminDashboard />} />
                        <Route path="/:catalogSlug/nosotros" element={<ClientNosotros />} />
                        <Route path="/:catalogSlug/carrito" element={<Carrito />} />
                        <Route path="/:catalogSlug" element={<CatalogPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
