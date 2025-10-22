import { useAdminStore } from '../../store/adminStore';
import { Plus } from 'lucide-react';  // npm install lucide-react si no tienes
import { useState } from 'react';
import ProductForm from './ProductForm';

function ProductList() {

  const activeCatalog = useAdminStore((state) => state.getActiveCatalog());
  const products = activeCatalog.products;  // ✅ Del active catalog
  const { addProduct, deleteProduct } = useAdminStore();  // Actions
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Productos ({products.length})</h3>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="flex items-center gap-2 bg-[#f24427] text-white px-4 py-2 rounded hover:bg-[#d6331a]">
          <Plus size={20} /> Agregar Producto
        </button>
      </div>

      {showForm && (
        <ProductForm onClose={() => setShowForm(false)} editingId={editingId} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (  // ✅ Usa products reactivos
          <div key={product.id} className="bg-[#171819] p-4 rounded-lg">
            <img src={product.ruta} alt={product.nombre} className="w-full h-32 object-cover rounded mb-2" />
            <h4 className="font-bold">{product.nombre}</h4>
            <p className="text-gray-400 text-sm">{product.description}</p>
            <p className="text-[#f24427] font-semibold">${product.precio}</p>
            <p className="text-sm">Stock: {product.stock}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setShowForm(true); setEditingId(product.id); }} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Editar
              </button>
              <button onClick={() => deleteProduct(product.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;