import { useAdminStore } from '../../store/adminStore';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Lock } from 'lucide-react';  // Íconos
import ProductList from './ProductList';
import ProductCard from '../ProductCard';
import CustomizationForm from './CustomizationForm';
import toast from 'react-hot-toast';  // Para feedback

function AdminDashboard() {
  // ✅ Reactive selector: Re-render al cambio de active catalog
  const activeCatalog = useAdminStore((state) => state.getActiveCatalog());
  const { getTotalProducts, getTotalStock, saveAll, activeId, loadCatalog, isReadOnly } = useAdminStore();
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();
  const { catalogSlug } = useParams();
  
  // Load catalog when component mounts or slug changes
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const clientId = localStorage.getItem('clientId');
    const slug = catalogSlug || userId || 'default';
    
    // Load the catalog data - pass clientId if available
    if (clientId && slug !== 'default') {
      loadCatalog(parseInt(clientId), slug);
    } else if (slug !== 'default') {
      // If we have a slug but no clientId, still try to load it
      loadCatalog(slug, slug);
    } else {
      loadCatalog('default', 'default');
    }
  }, [catalogSlug, loadCatalog]);
  
  // Determinar el slug del catálogo actual
  const currentSlug = catalogSlug || activeId;
  const readOnly = isReadOnly();

  const handleSaveAll = async () => {
    if (readOnly) {
      toast.error('No se puede modificar el catálogo por defecto');
      return;
    }
    
    const result = await saveAll();
    if (result.success) {
      toast.success('✅ Todo guardado correctamente. Redirigiendo...', { duration: 2000 });
      
      // Redirigir al catálogo personalizado después de guardar
      setTimeout(() => {
        if (currentSlug && currentSlug !== 'default') {
          navigate(`/${currentSlug}`);
        } else {
          navigate('/colecciones');
        }
      }, 1500);
    } else {
      toast.error('⚠️ ' + result.message, { duration: 3000 });
    }
  };

  const handleGoHome = () => {
    // If client has a catalog, go to their catalog page, otherwise go to landing
    if (currentSlug && currentSlug !== 'default') {
      navigate(`/${currentSlug}`);
    } else {
      navigate('/');
    }
  };

  const business = activeCatalog.business;  // Del active catalog

  return (
    <div className="min-h-screen bg-[#080c0e] text-white flex">
      {/* Sidebar responsive */}
      <aside className="w-64 bg-[#121516] p-4 hidden md:block">
        <h1 className="text-2xl font-bold mb-6">
          {business.nombre} Admin
          {readOnly && <Lock size={16} className="inline ml-2 text-yellow-400" title="Catálogo de solo lectura" />}
        </h1>
        {readOnly && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded text-sm">
            <p className="text-yellow-300">Este es el catálogo por defecto (solo lectura). Crea tu propia cuenta para editar.</p>
          </div>
        )}
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('products')} className={`w-full p-2 rounded ${activeTab === 'products' ? 'bg-[#f24427]' : 'hover:bg-gray-700'}`}>Gestión Productos</button>
          <button 
            onClick={() => setActiveTab('customization')} 
            className={`w-full p-2 rounded ${activeTab === 'customization' ? 'bg-[#f24427]' : 'hover:bg-gray-700'} ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={readOnly}
          >
            Personalización
          </button>
          <button onClick={() => setActiveTab('preview')} className={`w-full p-2 rounded ${activeTab === 'preview' ? 'bg-[#f24427]' : 'hover:bg-gray-700'}`}>
            <Eye size={16} className="inline mr-2" /> Vista Previa
          </button>
      </nav>
      {!readOnly && (
        <button onClick={handleSaveAll} className="w-full mt-4 bg-green-500 hover:bg-green-600 p-2 rounded flex items-center justify-center gap-2">
          <Save size={16} /> Guardar Todo
        </button>
      )}
    </aside>

      {/* Main */ }
  <main className="flex-1 p-4 md:p-8">
    {/* Header con Back y Preview Info */}
    <div className="flex justify-between items-center mb-6">
      <button onClick={handleGoHome} className="flex items-center gap-2 text-[#f24427] hover:underline cursor-pointer">
        <ArrowLeft size={20} /> Volver al Inicio
      </button>
      <div className="text-right">
        <h2 className="text-3xl font-bold">Panel de {business.nombre}</h2>
        <p className="text-gray-400">Productos: {getTotalProducts()} | Stock Total: {getTotalStock()}</p>
      </div>
    </div>

    {/* Preview Tab: Mini-Grid + Stats */}
        {activeTab === 'preview' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Vista Previa de tu Catálogo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {activeCatalog.products.slice(0, 4).map(product => (  // Mini-grid: 4 products
                <div key={product.id} className="bg-[#171819] p-3 rounded-lg">
                  <img src={product.ruta} alt={product.nombre} className="w-full h-20 object-cover rounded mb-1" />
                  <h4 className="font-bold text-sm">{product.nombre}</h4>
                  <p className="text-[#f24427] font-semibold text-sm">${product.precio}</p>
                  <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                </div>
              ))}
              {activeCatalog.products.length === 0 && (
                <p className="col-span-full text-gray-400 text-center">Agrega productos para ver preview.</p>
              )}
            </div>
            <div className="bg-[#171819] p-4 rounded-lg">
              <h4 className="font-bold mb-2">Estadísticas</h4>
              <p className="text-sm">Total Productos: <span className="font-semibold">{getTotalProducts()}</span></p>
              <p className="text-sm">Stock Total: <span className="font-semibold">{getTotalStock()}</span></p>
              <p className="text-xs text-gray-400 mt-2">Cambios en vivo —edita y ve actualizaciones aquí.</p>
            </div>
          </div>
        )}

    {/* Tabs Content */}
    {activeTab === 'products' && <ProductList />}
    {activeTab === 'customization' && <CustomizationForm />}
  </main>
    </div >
  );
}

export default AdminDashboard;