import { useAdminStore } from '../../store/adminStore';
import { Plus, Lock, Tags } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/products';

function ProductList() {
  const activeCatalog = useAdminStore((state) => state.getActiveCatalog());
  const products = activeCatalog.products;
  const { deleteProduct, isReadOnly } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [variantCounts, setVariantCounts] = useState({});
  const readOnly = isReadOnly();

  // Load variant counts for all products
  useEffect(() => {
    const loadVariantCounts = async () => {
      if (products.length === 0) return;
      
      // Load variant counts in parallel for better performance
      const countPromises = products.map(async (product) => {
        try {
          const variants = await productsApi.getVariants(product.id);
          return { id: product.id, count: variants?.length || 0 };
        } catch {
          return { id: product.id, count: 0 };
        }
      });
      
      const results = await Promise.all(countPromises);
      const counts = results.reduce((acc, { id, count }) => {
        acc[id] = count;
        return acc;
      }, {});
      
      setVariantCounts(counts);
    };

    loadVariantCounts();
  }, [products]);

  const handleDelete = async (id) => {
    if (readOnly) {
      toast.error('No se puede modificar el catálogo por defecto');
      return;
    }
    
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar producto: ' + error.message);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    // Refresh variant counts when form closes (in case variants were added/removed)
    const loadVariantCounts = async () => {
      if (products.length === 0) return;
      
      const countPromises = products.map(async (product) => {
        try {
          const variants = await productsApi.getVariants(product.id);
          return { id: product.id, count: variants?.length || 0 };
        } catch {
          return { id: product.id, count: 0 };
        }
      });
      
      const results = await Promise.all(countPromises);
      const counts = results.reduce((acc, { id, count }) => {
        acc[id] = count;
        return acc;
      }, {});
      
      setVariantCounts(counts);
    };
    loadVariantCounts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          Productos ({products.length})
          {readOnly && <Lock size={16} className="inline ml-2 text-yellow-400" title="Solo lectura" />}
        </h3>
        {!readOnly && (
          <button 
            onClick={() => { setShowForm(true); setEditingId(null); }} 
            className="flex items-center gap-2 bg-[#f24427] text-white px-4 py-2 rounded hover:bg-[#d6331a]"
          >
            <Plus size={20} /> Agregar Producto
          </button>
        )}
      </div>

      {readOnly && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
          <p className="text-yellow-300 text-sm">Este es el catálogo por defecto (solo lectura). Crea tu propia cuenta para agregar y editar productos.</p>
        </div>
      )}

      {showForm && (
        <ProductForm onClose={handleFormClose} editingId={editingId} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400">
            <p>No hay productos en este catálogo.</p>
            {!readOnly && <p className="text-sm mt-2">Haz clic en "Agregar Producto" para comenzar.</p>}
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="bg-[#171819] p-4 rounded-lg">
              <img src={product.ruta} alt={product.nombre} className="w-full h-32 object-cover rounded mb-2" />
              <h4 className="font-bold">{product.nombre}</h4>
              <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[#f24427] font-semibold">${product.precio}</p>
                {variantCounts[product.id] > 0 && (
                  <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                    <Tags size={12} />
                    {variantCounts[product.id]} variante{variantCounts[product.id] !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">Stock: {product.stock}</p>
              {product.category && (
                <p className="text-xs text-gray-500 mt-1">Categoría: {product.category}</p>
              )}
              {!readOnly && (
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => { setShowForm(true); setEditingId(product.id); }} 
                    className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductList;