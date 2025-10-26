import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import App from "../pages/App";
import AdminDashboard from "../components/admin/AdminDashboard";
import LoginRole from "../components/auth/LoginRole";
import HomePage from "../pages/App"; // si usas App como landing
// NOTA: define primero las rutas estáticas para que la ruta dinámica no haga "shadow"

export function Router() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {/* Rutas estáticas / landing / info */}
                <Route path="/" element={<App />} />
                <Route path="/colecciones" element={<App />} />
                <Route path="/nosotros" element={<div>Nosotros</div>} />
                <Route path="/contacto" element={<div>Contacto</div>} />
                <Route path="/login-role" element={<LoginRole />} />
                {/* Admin genérico si lo necesitas */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Rutas por catálogo (amigables) */}
                <Route path="/:catalogSlug/admin" element={<AdminDashboard />} />
                <Route path="/:catalogSlug" element={<App />} />

                {/* Futuras rutas: /user, /cart, /checkout */}
            </Routes>
        </BrowserRouter>
    );
}