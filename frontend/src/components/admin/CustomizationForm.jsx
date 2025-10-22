import { useForm } from 'react-hook-form';
import { useAdminStore } from '../../store/adminStore';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';  // Para feedback

function CustomizationForm() {
  const { business, updateBusiness, loadProducts } = useAdminStore();
  // ✅ Destructuring completo: incluye reset
  const { register, handleSubmit, setValue, reset, watch } = useForm({ defaultValues: business });

  // ✅ Force load initial si business vacío
  useEffect(() => {
    if (!business) {
      loadProducts();  // Carga default si null
    }
    reset(business || {});  // Reset con fallback
  }, [business, reset, loadProducts]);

  const onSubmit = (data) => {
    updateBusiness(data);  // Actualiza store (persiste local)
    // Aplica CSS vars global inmediatamente
    document.documentElement.style.setProperty('--primary-color', data.color);
    toast.success('Personalización guardada y aplicada en vivo.');  // Toast confirm
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setValue('logo', URL.createObjectURL(acceptedFiles[0])),
    accept: { 'image/*': [] }
  });

  // Watch para preview en vivo (reacciona a cambios sin submit)
  const watchedLogo = watch('logo');
  const currentLogo = watchedLogo || business?.logo || '/logosinfondo.png';

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Personaliza tu Catálogo</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('nombre')} placeholder="Nombre del Negocio" className="w-full p-2 bg-[#171819] text-white rounded border border-gray-600 focus:border-[var(--primary-color)]" />
        
        <input {...register('color', { required: true })} type="color" className="w-full h-10 rounded" />
        
        <input {...register('telefono')} placeholder="Teléfono WhatsApp" className="w-full p-2 bg-[#171819] text-white rounded border border-gray-600 focus:border-[var(--primary-color)]" />
        
        <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-4 rounded cursor-pointer hover:border-[var(--primary-color)]">
          <input {...getInputProps()} />
          <p className="text-gray-400">Arrastra logo o clic para subir</p>
        </div>

        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-semibold flex items-center justify-center gap-2">
          <Save size={20} /> Guardar Cambios
        </button>
      </form>

     {/* Preview en vivo */}
      <div className="mt-6 p-4 bg-[#171819] rounded">
        <h4 className="font-bold mb-2">Preview:</h4>
        <div className="flex items-center gap-4">
          <img src={currentLogo} alt="Logo Preview" className="w-32 h-32 object-cover rounded" onError={(e) => { e.target.src = '/logosinfondo.png'; }} />
          <span style={{ color: watch('color') || business?.color || '#f24427', fontWeight: 'bold' }}>Hola, {watch('nombre') || business?.nombre || 'UrbanStreet'}!</span>
          <span className="text-sm text-gray-400 ml-4">Tel: {watch('telefono') || business?.telefono || '1234567890'}</span>
        </div>
      </div>
    </div>
  );
}

export default CustomizationForm;