import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

// Helper simple para generar slug seguro a partir del nombre del negocio
const makeSlug = (text) => {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')           // espacios → guiones
    .replace(/[^A-Za-z0-9-]/g, '') // quitar chars inválidos
    .replace(/-+/g, '-')          // múltiples guiones → 1
    .toLowerCase();
};

function LoginRole() {
  const [mode, setMode] = useState(''); // '', 'register', 'login', 'user'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [negocioNombre, setNegocioNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const navigate = useNavigate();
  const { clearStorage, loadCatalog } = useAdminStore();

  const handleRoleSelect = (selectedRole) => {
    if (selectedRole === 'user') {
      // Usuario: Modo viewer, usa default read-only
      localStorage.setItem('role', 'user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('clientId');
      clearStorage();  // Reset store a default
      navigate('/');  // Directo a home
      toast.success('Modo Usuario: Explora catálogos y carrito.');
    } else {
      setMode(selectedRole);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !nombre || !negocioNombre) {
      return toast.error('Completa todos los campos requeridos.');
    }

    if (password.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres.');
    }

    try {
      // Register new client with authentication
      const response = await authApi.register(email, password, nombre, negocioNombre, telefono);
      
      if (!response.success) {
        toast.error(response.message || 'Error al registrar.');
        return;
      }

      // Store authentication data
      localStorage.setItem('role', 'cliente');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('clientId', response.client.id.toString());
      
      // Generate slug for navigation
      const slug = makeSlug(negocioNombre) || 'client-' + response.client.id;
      localStorage.setItem('userId', slug);

      toast.success(`¡Bienvenido, ${negocioNombre}! Cuenta creada exitosamente.`);
      
      // Load the catalog for this client
      await loadCatalog(response.client.id, slug);
      
      // Navigate to admin panel
      navigate(`/${slug}/admin`);
    } catch (err) {
      console.error('Error en registro:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      toast.error(`No se pudo registrar: ${errorMessage}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Ingresa email y contraseña.');
    }

    try {
      // Login existing client
      const response = await authApi.login(email, password);
      
      if (!response.success) {
        toast.error(response.message || 'Credenciales inválidas.');
        return;
      }

      if (!response.client) {
        toast.error('No se encontró un negocio asociado a esta cuenta.');
        return;
      }

      // Store authentication data
      localStorage.setItem('role', 'cliente');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('clientId', response.client.id.toString());
      
      // Generate slug for navigation
      const slug = makeSlug(response.client.nombre) || 'client-' + response.client.id;
      localStorage.setItem('userId', slug);

      toast.success(`¡Bienvenido de nuevo, ${response.client.nombre}!`);
      
      // Load the catalog for this client
      await loadCatalog(response.client.id, slug);
      
      // Navigate to admin panel
      navigate(`/${slug}/admin`);
    } catch (err) {
      console.error('Error en login:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      toast.error(`No se pudo iniciar sesión: ${errorMessage}`);
    }
  };

  // Registration form
  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
        <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Crear Nueva Cuenta</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu Nombre Completo"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña (mínimo 6 caracteres)"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
              minLength={6}
            />
            <input
              type="text"
              value={negocioNombre}
              onChange={(e) => setNegocioNombre(e.target.value)}
              placeholder="Nombre de tu Negocio"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
            />
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono (opcional)"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
            />
            <button type="submit" className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold">
              Crear Cuenta y Catálogo
            </button>
          </form>
          <p className="text-gray-400 text-xs mt-4 text-center">
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => setMode('login')} className="text-[#f24427] hover:underline">
              Inicia sesión aquí
            </button>
          </p>
          <button onClick={() => setMode('')} className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Login form
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
        <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
            />
            <button type="submit" className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold">
              Iniciar Sesión
            </button>
          </form>
          <p className="text-gray-400 text-xs mt-4 text-center">
            ¿No tienes cuenta?{' '}
            <button onClick={() => setMode('register')} className="text-[#f24427] hover:underline">
              Regístrate aquí
            </button>
          </p>
          <button onClick={() => setMode('')} className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Role selection (initial screen)
  return (
    <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
      <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Elige tu Rol</h2>
        <div className="space-y-4">
          <button 
            onClick={() => handleRoleSelect('register')} 
            className="w-full bg-[#f24427] text-white py-4 rounded font-semibold hover:bg-[#d6331a]"
          >
            Crear Mi Cuenta (Cliente Nuevo)
          </button>
          <button 
            onClick={() => handleRoleSelect('login')} 
            className="w-full bg-green-600 text-white py-4 rounded font-semibold hover:bg-green-700"
          >
            Iniciar Sesión (Cliente Existente)
          </button>
          <button 
            onClick={() => handleRoleSelect('user')} 
            className="w-full bg-blue-500 text-white py-4 rounded font-semibold hover:bg-blue-600"
          >
            Soy Usuario: Explorar Catálogos
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-4 text-center">
          Cliente: Administra tu negocio y catálogo.<br/>
          Usuario: Explora y compra en catálogos disponibles.
        </p>
      </div>
    </div>
  );
}

export default LoginRole;