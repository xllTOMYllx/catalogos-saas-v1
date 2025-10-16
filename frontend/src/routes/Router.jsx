import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import ScrollToTop from "../components/ScrollToTop";
import App from "../pages/App";
import AdminDashboard from "../components/admin/AdminDashboard";  // Nuevo: Panel admin

// Hook Auth Stub (simula con localStorage —sin backend)
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Checa localStorage al inicio
    return localStorage.getItem('authToken') === 'mock-token';
  });

const login = (email, password) => {
    // Mock: si email="admin@test.com" y pass="123", setea token
    if (email === 'admin@test.com' && password === '123') {
      localStorage.setItem('authToken', 'mock-token');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

// Componente Login Simple (para /login)
function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      window.location.href = '/admin';  // Redirige a admin
    } else {
      setError('Credenciales inválidas. Usa admin@test.com / 123');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
      <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login Admin</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] outline-none"
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold">
            Entrar
          </button>
        </form>
        <p className="text-gray-400 text-xs mt-4 text-center">Mock: admin@test.com / 123</p>
      </div>
    </div>
  );
}

// ProtectedRoute (ahora con useAuth)
function ProtectedRoute({ children }) {
  const { isAuthenticated, logout } = useAuth();
  if (!isAuthenticated) return <Login />;  // Redirige a login si no auth

  return (
    <div className="relative">
      <button onClick={logout} className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      {children}
    </div>
  );
}

// Ruta Admin con ProtectedRoute
function AdminPanel() {
  return <ProtectedRoute><AdminDashboard /></ProtectedRoute>;
}

// Función principal de rutas
export function Router() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<App />} />  {/* Tu landing como / */}
                <Route path="/admin" element={<AdminPanel />} />  {/* Admin desde header */}
                <Route path="/login" element={<Login />} />  {/* Ruta login */}
                {/* Futuras: <Route path="/catalogo/:idNegocio" element={<App />} /> */}
            </Routes>
        </BrowserRouter>
    );
}