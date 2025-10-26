import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import toast from 'react-hot-toast';  // Para feedback

// Helper simple para generar slug seguro a partir del nombre del negocio
const makeSlug = (text) => {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')           // espacios → guiones
    .replace(/[^A-Za-z0-9\-]/g, '') // quitar chars inválidos
    .replace(/\-+/g, '-')          // múltiples guiones → 1
    .toLowerCase();
};

function LoginRole() {
  const [role, setRole] = useState('');  // 'cliente' o 'user'
  const [email, setEmail] = useState('');
  const [negocioNombre, setNegocioNombre] = useState('');
  const navigate = useNavigate();
  const { loadProducts, updateBusiness, clearStorage } = useAdminStore();  // Store actions

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'user') {
      // Usuario: Modo viewer, usa default read-only
      localStorage.setItem('role', 'user');
      clearStorage();  // Reset store a default
      navigate('/');  // Directo a home
      toast.success('Modo Usuario: Explora catálogos y carrito.');
    }
  };

  const handleClienteRegister = async (e) => {
    e.preventDefault();
    if (!email || !negocioNombre) return toast.error('Completa email y nombre negocio.');

    // Generamos slug a partir del nombre del negocio
    const slug = makeSlug(negocioNombre) || btoa(email).substring(0, 8);

    // Guardamos role y userId como slug (clave del catálogo)
    localStorage.setItem('role', 'cliente');
    localStorage.setItem('userId', slug);
    // Set a simple auth token to indicate authenticated state
    localStorage.setItem('authToken', 'local-client-' + slug);

    // Creamos catálogo vacío para este cliente (no clonar el default por defecto)
    try {
      // loadProducts(initialProducts, userId, isClone)
      // Aquí pasamos [] como initial para crear un catálogo sin productos
      await loadProducts([], slug, true);

      // Actualizamos datos del business para este catálogo (si updateBusiness existe)
      if (typeof updateBusiness === 'function') {
        await updateBusiness({ nombre: negocioNombre, email, userId: slug, slug });
      } else {
        // fallback: intenta setear business directamente en store
        const state = useAdminStore.getState();
        const catalogs = { ...(state.catalogs || {}) };
        catalogs[slug] = catalogs[slug] || { products: [], business: { nombre: negocioNombre, email, slug } };
        useAdminStore.setState({ catalogs, activeId: slug });
      }

      toast.success(`Bienvenido, ${negocioNombre}! Catálogo creado. Accediendo a tu panel.`);
      // Navegamos al admin específico del catálogo
      navigate(`/${slug}/admin`);
    } catch (err) {
      console.error('Error creando catálogo:', err);
      toast.error('No se pudo crear el catálogo. Reintenta.');
    }
  };

  if (role === 'cliente') {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
        <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Crea tu Catálogo (Cliente)</h2>
          <form onSubmit={handleClienteRegister} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (para tu cuenta)"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
            />
            <input
              type="text"
              value={negocioNombre}
              onChange={(e) => setNegocioNombre(e.target.value)}
              placeholder="Nombre de tu Negocio"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427]"
              required
            />
            <button type="submit" className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold">
              Crear Catálogo y Acceder al Panel
            </button>
          </form>
          <p className="text-gray-400 text-xs mt-4 text-center">Crearemos tu catálogo vacío. Podrás agregar productos en tu panel.</p>
          <button onClick={() => setRole('')} className="w-full mt-4 bg-gray-500 text-white py-2 rounded">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
      <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Elige tu Rol</h2>
        <div className="space-y-4">
          <button onClick={() => handleRoleSelect('cliente')} className="w-full bg-[#f24427] text-white py-4 rounded font-semibold hover:bg-[#d6331a]">
            Soy Cliente: Crea y Edita mi Catálogo
          </button>
          <button onClick={() => handleRoleSelect('user')} className="w-full bg-blue-500 text-white py-4 rounded font-semibold hover:bg-blue-600">
            Soy Usuario: Explora y Compra
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-4 text-center">Cliente: Admin para tu negocio. Usuario: Ver/carrito en catálogos disponibles.</p>
      </div>
    </div>
  );
}

export default LoginRole;