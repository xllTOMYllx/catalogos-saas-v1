import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import LandingPage from "../pages/LandingPage";
import CatalogPage from "../pages/CatalogPage";
import AdminDashboard from "../components/admin/AdminDashboard";
import LoginRole from "../components/auth/LoginRole";
import Nosotros from "../pages/Nosotros";
import Contacto from "../pages/Contacto";
import Carrito from "../pages/Carrito";
import Header from "../components/Header";
// NOTA: define primero las rutas estáticas para que la ruta dinámica no haga "shadow"

export function Router() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Header />
            <Routes>
                {/* Rutas estáticas / landing / info */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/colecciones" element={<CatalogPage />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/login-role" element={<LoginRole />} />
                {/* Admin genérico si lo necesitas */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Rutas por catálogo (amigables) */}
                <Route path="/:catalogSlug/admin" element={<AdminDashboard />} />
                <Route path="/:catalogSlug" element={<CatalogPage />} />

                {/* Futuras rutas: /user, /cart, /checkout */}
            </Routes>
        </BrowserRouter>
    );
}
