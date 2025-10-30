import { useForm } from 'react-hook-form';
import { useAdminStore } from '../../store/adminStore';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';  // Para feedback
import { uploadApi } from '../../api/upload';

function CustomizationForm() {
  const activeCatalog = useAdminStore((state) => state.getActiveCatalog());
  const { updateBusiness, isReadOnly } = useAdminStore();
  const business = activeCatalog.business;
  const readOnly = isReadOnly();
  
  // ✅ Destructuring completo: incluye reset
  const { register, handleSubmit, setValue, reset, watch } = useForm({ defaultValues: business });

  // ✅ Force load initial si business vacío
  useEffect(() => {
    reset(business || {});  // Reset with fallback
  }, [business, reset]);

  const onSubmit = async (data) => {
    if (readOnly) {
      toast.error('No se puede modificar el catálogo por defecto');
      return;
    }
    
    try {
      await updateBusiness(data);  // Actualiza store (persiste en BD)
      // Aplica CSS vars global inmediatamente
      document.documentElement.style.setProperty('--primary-color', data.color);
      toast.success('Personalización guardada y aplicada en vivo.');  // Toast confirm
    } catch (error) {
      toast.error('Error al guardar personalización: ' + error.message);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          toast.loading('Subiendo imagen...');
          const result = await uploadApi.uploadImage(file);
          // Store just the relative URL path (proxied in dev, absolute in prod)
          setValue('logo', result.url);
          toast.dismiss();
          toast.success('Imagen cargada correctamente');
        } catch (error) {
          toast.dismiss();
          toast.error('Error al subir imagen: ' + error.message);
        }
      }
    },
    accept: { 'image/*': [] }
  });

  // Watch para preview en vivo (reacciona a cambios sin submit)
  const watchedLogo = watch('logo');
  const currentLogo = watchedLogo || business?.logo || '/logosinfondo.png';

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">
        Personaliza tu Catálogo
        {readOnly && <Lock size={16} className="inline ml-2 text-yellow-400" title="Solo lectura" />}
      </h3>
      {readOnly && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
          <p className="text-yellow-300 text-sm">Este es el catálogo por defecto y no se puede modificar. Crea tu propia cuenta de cliente para personalizar tu catálogo.</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input 
          {...register('nombre')} 
          placeholder="Nombre del Negocio" 
          className="w-full p-2 bg-[#171819] text-white rounded border border-gray-600 focus:border-[var(--primary-color)]" 
          disabled={readOnly}
        />
        
        <input 
          {...register('color', { required: true })} 
          type="color" 
          className="w-full h-10 rounded" 
          disabled={readOnly}
        />
        
        <input 
          {...register('telefono')} 
          placeholder="Teléfono WhatsApp" 
          className="w-full p-2 bg-[#171819] text-white rounded border border-gray-600 focus:border-[var(--primary-color)]" 
          disabled={readOnly}
        />
        
        <input 
          {...register('direccion')} 
          placeholder="Dirección del Negocio" 
          className="w-full p-2 bg-[#171819] text-white rounded border border-gray-600 focus:border-[var(--primary-color)]" 
          disabled={readOnly}
        />
        
        <textarea 
          {...register('descripcion')} 
          placeholder="Descripción del Negocio" 
          rows="3"
          className="w-full p-2 bg-[#171819] text-white rounded border border-gray-600 focus:border-[var(--primary-color)]" 
          disabled={readOnly}
        />
        
        <div {...getRootProps()} className={`border-2 border-dashed border-gray-600 p-4 rounded ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--primary-color)]'}`}>
          <input {...getInputProps()} disabled={readOnly} />
          <p className="text-gray-400">
            {readOnly ? 'Vista previa del logo' : 'Arrastra logo o clic para subir'}
          </p>
        </div>

        {!readOnly && (
          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-semibold flex items-center justify-center gap-2">
            <Save size={20} /> Guardar Cambios
          </button>
        )}
      </form>

     {/* Preview en vivo */}
      <div className="mt-6 p-4 bg-[#171819] rounded">
        <h4 className="font-bold mb-2">Preview:</h4>
        <div className="flex items-center gap-4">
          <img src={currentLogo} alt="Logo Preview" className="w-32 h-32 object-cover rounded" onError={(e) => { e.target.src = '/logosinfondo.png'; }} />
          <div className="flex-1">
            <span style={{ color: watch('color') || business?.color || '#f24427', fontWeight: 'bold' }}>
              {watch('nombre') || business?.nombre || 'UrbanStreet'}
            </span>
            <p className="text-sm text-gray-400 mt-1">Tel: {watch('telefono') || business?.telefono || '1234567890'}</p>
            {(watch('direccion') || business?.direccion) && (
              <p className="text-sm text-gray-400 mt-1">Dir: {watch('direccion') || business?.direccion}</p>
            )}
            {(watch('descripcion') || business?.descripcion) && (
              <p className="text-sm text-gray-300 mt-2">{watch('descripcion') || business?.descripcion}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomizationForm;