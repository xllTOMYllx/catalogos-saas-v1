import { useAdminStore } from '../../store/adminStore';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

function CustomizationForm() {
  const { business, updateBusiness } = useAdminStore();
  const { register, handleSubmit, setValue } = useForm({ defaultValues: business });

  useEffect(() => {
    Object.keys(business).forEach(key => setValue(key, business[key]));
  }, [business, setValue]);

  const onSubmit = (data) => {
    updateBusiness(data);
    // Aplica CSS vars global
    document.documentElement.style.setProperty('--primary-color', data.color);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setValue('logo', URL.createObjectURL(acceptedFiles[0])),
  });

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Personaliza tu Catálogo</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('nombre')} placeholder="Nombre del Negocio" className="w-full p-2 bg-[#171819] text-white rounded" />
        
        <input {...register('color', { required: true })} type="color" className="w-full h-10 rounded" />
        
        <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-4 rounded cursor-pointer">
          <input {...getInputProps()} />
          <p className="text-gray-400">Arrastra logo o clic para subir</p>
          {business.logo && <img src={business.logo} alt="Logo Preview" className="w-32 h-32 object-cover mt-2 rounded" />}
        </div>

        <button type="submit" className="bg-[#f24427] text-white px-6 py-2 rounded hover:bg-[#d6331a]">Guardar Cambios</button>
      </form>

      {/* Preview en vivo */}
      <div className="mt-6 p-4 bg-[#171819] rounded">
        <h4 className="font-bold mb-2">Preview:</h4>
        <div className="flex items-center gap-4">
          <img src={business.logo} alt="Logo" className="w-12 h-12" />
          <span style={{ color: business.color }}>Hola, {business.nombre}!</span>
        </div>
      </div>
    </div>
  );
}

export default CustomizationForm;