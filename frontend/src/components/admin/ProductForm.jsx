import { useForm } from 'react-hook-form';
import { useAdminStore } from '../../store/adminStore';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';  // Para feedback

function ProductForm({ onClose, editingId }) {
  const activeCatalog = useAdminStore((state) => state.getActiveCatalog());
  const { addProduct, updateProduct } = useAdminStore();
  const { register, handleSubmit, reset, setValue } = useForm();
  const products = activeCatalog.products || [];
  const editingProduct = products.find(p => p.id === editingId);

  useEffect(() => {
    if (editingProduct) {
      Object.keys(editingProduct).forEach(key => setValue(key, editingProduct[key]));
    } else {
      reset();
    }
  }, [editingProduct, reset, setValue]);

  // En onSubmit:
  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateProduct(editingId, data);  // ✅ Actualiza stock del input
        toast.success('Producto actualizado.');
      } else {
        await addProduct(data);  // ✅ Usa data.stock del input
        toast.success('Producto agregado.');
      }
      onClose();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Convert image to base64 data URL instead of blob URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setValue('ruta', reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    accept: { 'image/*': [] }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121516] p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Producto' : 'Agregar Producto'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('nombre', { required: 'Nombre requerido' })} placeholder="Nombre" className="w-full p-2 bg-[#171819] text-white rounded" />
          <textarea {...register('description')} placeholder="Descripción" className="w-full p-2 bg-[#171819] text-white rounded h-20" />
          <input {...register('precio', { required: true, min: 0 })} type="number" placeholder="Precio" className="w-full p-2 bg-[#171819] text-white rounded" />
          <input {...register('stock', { required: true, min: 0 })} type="number" placeholder="Stock" className="w-full p-2 bg-[#171819] text-white rounded" />
          <input {...register('category')} placeholder="Categoría (ej: Ropa, Accesorios)" className="w-full p-2 bg-[#171819] text-white rounded" />
          
          <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-4 rounded cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-gray-400">Arrastra imagen o clic para subir</p>
            {register('ruta').value && <img src={register('ruta').value} alt="Preview" className="w-full h-32 object-cover mt-2 rounded" />}
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;