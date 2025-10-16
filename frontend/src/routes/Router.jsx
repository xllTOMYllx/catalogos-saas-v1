import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import App from "../pages/App";

// Stub para Admin
function AdminPanel() {
  return (
    <div className="p-8 text-white min-h-screen bg-[#080c0e] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
        <p>Gestión de productos: agregar, editar y eliminar (Próximamente con forms).</p>
      </div>
    </div>
  );
}

// Función principal de rutas
export function Router() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<App />} />  {/* Tu landing como / */}
                <Route path="/admin" element={<AdminPanel />} />  {/* Admin desde header */}
                {/* Futuras: <Route path="/catalogo/:idNegocio" element={<App />} /> */}
            </Routes>
        </BrowserRouter>
    );
}