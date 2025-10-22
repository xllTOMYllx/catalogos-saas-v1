import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import ScrollToTop from "../components/ScrollToTop";
import App from "../pages/App";
import AdminDashboard from "../components/admin/AdminDashboard";
import { useAuth } from "../hooks/useAuth";  // Tu hook mock
import LoginRole from "../components/auth/LoginRole";  // ✅ Nuevo: Toggle role

// ... tu Login y ProtectedRoute (mantén como antes)

// Función principal de rutas
export function Router() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/admin" element={<AdminDashboard />} />  // Tu AdminPanel con ProtectedRoute
                <Route path="/login-role" element={<LoginRole />} />  // ✅ Nueva ruta toggle
                {/* Futuras: <Route path="/catalogo/:id" element={<App />} /> */}
            </Routes>
        </BrowserRouter>
    );
}