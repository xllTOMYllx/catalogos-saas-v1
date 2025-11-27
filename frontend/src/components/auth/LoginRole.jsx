import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuth } from '../../contexts/useAuth';
import toast from 'react-hot-toast';
import PasswordInput from '../PasswordInput';
import { getValidationError } from '../../utils/validation';
import { Shield } from 'lucide-react';

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
  const [mode, setMode] = useState(''); // '', 'register', 'login', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [negocioNombre, setNegocioNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const navigate = useNavigate();
  const { loadCatalog } = useAdminStore();
  const { login: authLogin, register: authRegister } = useAuth();

  const handleRoleSelect = (selectedRole) => {
    setMode(selectedRole);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Ingresa email y contraseña.');
    }

    try {
      const response = await authLogin(email, password);
      
      if (!response.success) {
        toast.error(response.message || 'Credenciales inválidas.');
        return;
      }

      if (response.user?.role !== 'admin') {
        toast.error('Esta cuenta no tiene permisos de administrador.');
        return;
      }

      toast.success('¡Bienvenido, Administrador!');
      navigate('/super-admin');
    } catch (err) {
      console.error('Error en login de admin:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      toast.error(`No se pudo iniciar sesión: ${errorMessage}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!email || !password || !nombre || !negocioNombre) {
      return toast.error('Completa todos los campos requeridos.');
    }

    // Validate email format
    const emailError = getValidationError('Email', email, 'email');
    if (emailError) {
      return toast.error(emailError);
    }

    // Validate name format
    const nombreError = getValidationError('Nombre', nombre, 'name');
    if (nombreError) {
      return toast.error(nombreError);
    }

    // Validate business name format
    const negocioError = getValidationError('Nombre del negocio', negocioNombre, 'businessName');
    if (negocioError) {
      return toast.error(negocioError);
    }

    // Validate phone format (if provided)
    if (telefono) {
      const telefonoError = getValidationError('Teléfono', telefono, 'phone');
      if (telefonoError) {
        return toast.error(telefonoError);
      }
    }

    // Validate password length
    if (password.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres.');
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return toast.error('Las contraseñas no coinciden.');
    }

    try {
      // Register new client with authentication using AuthContext
      const response = await authRegister(email, password, nombre, negocioNombre, telefono);
      
      if (!response.success) {
        toast.error(response.message || 'Error al registrar.');
        return;
      }

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
      // Login existing client using AuthContext
      const response = await authLogin(email, password);
      
      if (!response.success) {
        toast.error(response.message || 'Credenciales inválidas.');
        return;
      }

      if (!response.client) {
        toast.error('No se encontró un negocio asociado a esta cuenta.');
        return;
      }

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
            <div>
              <label htmlFor="register-nombre" className="block text-gray-300 mb-2">
                Nombre Completo
              </label>
              <input
                id="register-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu Nombre Completo"
                className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-gray-300 mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@ejemplo.com"
                className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
                required
              />
            </div>
            <PasswordInput
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña (mínimo 6 caracteres)"
              label="Contraseña"
              required={true}
              minLength={6}
              showStrengthIndicator={true}
            />
            <PasswordInput
              id="register-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              label="Confirmar Contraseña"
              required={true}
              minLength={6}
            />
            <div>
              <label htmlFor="register-negocio" className="block text-gray-300 mb-2">
                Nombre del Negocio
              </label>
              <input
                id="register-negocio"
                type="text"
                value={negocioNombre}
                onChange={(e) => setNegocioNombre(e.target.value)}
                placeholder="Nombre de tu Negocio"
                className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="register-telefono" className="block text-gray-300 mb-2">
                Teléfono (opcional)
              </label>
              <input
                id="register-telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+52 1234567890"
                className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
              />
            </div>
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
            <div>
              <label htmlFor="login-email" className="block text-gray-300 mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@ejemplo.com"
                className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
                required
              />
            </div>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              label="Contraseña"
              required={true}
            />
            <button type="submit" className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold">
              Iniciar Sesión
            </button>
          </form>
          <div className="mt-3 text-center">
            <button 
              onClick={() => navigate('/forgot-password')} 
              className="text-gray-400 hover:text-[#f24427] text-sm underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
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

  // Admin login form
  if (mode === 'admin') {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
        <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-[#f24427]" />
            <h2 className="text-2xl font-bold text-white">Acceso Administrador</h2>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-gray-300 mb-2">
                Email de Administrador
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@test.com"
                className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
                required
              />
            </div>
            <PasswordInput
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              label="Contraseña"
              required={true}
            />
            <button type="submit" className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold">
              Acceder al Panel
            </button>
          </form>
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
            onClick={() => handleRoleSelect('admin')} 
            className="w-full bg-gray-700 text-white py-4 rounded font-semibold hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Administrador del Sistema
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-4 text-center">
          Cliente: Administra tu negocio y catálogo.<br/>
          Administrador: Gestiona todas las cuentas del sistema.
        </p>
      </div>
    </div>
  );
}

export default LoginRole;