import { useForm } from 'react-hook-form';
import { useAdminStore } from '../../store/adminStore';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadApi } from '../../api/upload';
import { productsApi } from '../../api/products';
import SubscriptionLimitModal from '../SubscriptionLimitModal';
import { isSubscriptionLimitError, parseSubscriptionError } from '../../utils/subscriptionErrors';
import { Plus, X, Loader2, Tags } from 'lucide-react';

// Common variant type suggestions
const VARIANT_TYPE_SUGGESTIONS = ['Talla', 'Color', 'Tamaño', 'Material', 'Estilo'];

function ProductForm({ onClose, editingId }) {
  const activeCatalog = useAdminStore((state) => state.getActiveCatalog());
  const { addProduct, updateProduct } = useAdminStore();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const products = activeCatalog.products || [];
  const editingProduct = products.find(p => p.id === editingId);
  const [limitError, setLimitError] = useState(null);
  
  // Variant management state
  const [showVariants, setShowVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [existingVariants, setExistingVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [newVariantType, setNewVariantType] = useState('');
  const [newVariantValue, setNewVariantValue] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('0');
  const [newVariantStock, setNewVariantStock] = useState('0');
  const [variantsToDelete, setVariantsToDelete] = useState([]);
  
  // Watch image URL for preview
  const imageUrl = watch('ruta');

  // Load existing variants when editing
  useEffect(() => {
    if (editingId && editingProduct) {
      const loadVariants = async () => {
        try {
          setLoadingVariants(true);
          const productVariants = await productsApi.getVariants(editingId);
          setExistingVariants(productVariants || []);
          if (productVariants && productVariants.length > 0) {
            setShowVariants(true);
          }
        } catch (error) {
          console.error('Error loading variants:', error);
        } finally {
          setLoadingVariants(false);
        }
      };
      loadVariants();
    }
  }, [editingId, editingProduct]);

  useEffect(() => {
    if (editingProduct) {
      Object.keys(editingProduct).forEach(key => setValue(key, editingProduct[key]));
    } else {
      reset();
      setVariants([]);
      setExistingVariants([]);
      setVariantsToDelete([]);
    }
  }, [editingProduct, reset, setValue]);

  // Add new variant to the list
  const handleAddVariant = useCallback(() => {
    if (!newVariantType.trim() || !newVariantValue.trim()) {
      toast.error('Ingresa tipo y valor de la variante');
      return;
    }

    const newVariant = {
      tempId: Date.now(),
      variantType: newVariantType.trim(),
      variantValue: newVariantValue.trim(),
      additionalPrice: parseFloat(newVariantPrice) || 0,
      stock: parseInt(newVariantStock) || 0,
      active: true,
    };

    setVariants(prev => [...prev, newVariant]);
    setNewVariantValue('');
    setNewVariantPrice('0');
    setNewVariantStock('0');
  }, [newVariantType, newVariantValue, newVariantPrice, newVariantStock]);

  // Remove a new variant (not yet saved)
  const handleRemoveNewVariant = useCallback((tempId) => {
    setVariants(prev => prev.filter(v => v.tempId !== tempId));
  }, []);

  // Mark existing variant for deletion
  const handleDeleteExistingVariant = useCallback((variantId) => {
    setVariantsToDelete(prev => [...prev, variantId]);
    setExistingVariants(prev => prev.filter(v => v.id !== variantId));
  }, []);

  // Update an existing variant's field
  const handleUpdateExistingVariant = useCallback((variantId, field, value) => {
    setExistingVariants(prev => prev.map(v => 
      v.id === variantId ? { ...v, [field]: value, _modified: true } : v
    ));
  }, []);

  const onSubmit = async (data) => {
    try {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, catalogId: _catalogId, catalogs: _catalogs, active: _active, ...productData } = data;
      
      let productId = editingId;
      
      if (editingId) {
        await updateProduct(editingId, productData);
        toast.success('Producto actualizado.');
      } else {
        const result = await addProduct(productData);
        // addProduct returns the new product with id property
        productId = result?.id;
        if (!productId) {
          console.warn('Could not get product ID from addProduct result');
        }
        toast.success('Producto agregado.');
      }

      // Handle variants if product was saved successfully and we have a productId
      if (productId && showVariants) {
        const variantErrors = [];

        // Delete marked variants in parallel
        if (variantsToDelete.length > 0) {
          const deleteResults = await Promise.allSettled(
            variantsToDelete.map(variantId => productsApi.deleteVariant(variantId))
          );
          deleteResults.forEach((result, index) => {
            if (result.status === 'rejected') {
              variantErrors.push(`Error eliminando variante ${variantsToDelete[index]}`);
            }
          });
        }

        // Update modified existing variants in parallel
        const modifiedVariants = existingVariants.filter(v => v._modified);
        if (modifiedVariants.length > 0) {
          const updateResults = await Promise.allSettled(
            modifiedVariants.map(variant => 
              productsApi.updateVariant(variant.id, {
                variantType: variant.variantType,
                variantValue: variant.variantValue,
                additionalPrice: parseFloat(variant.additionalPrice) || 0,
                stock: parseInt(variant.stock) || 0,
              })
            )
          );
          updateResults.forEach((result, index) => {
            if (result.status === 'rejected') {
              variantErrors.push(`Error actualizando variante "${modifiedVariants[index].variantValue}"`);
            }
          });
        }

        // Create new variants (bulk operation)
        if (variants.length > 0) {
          try {
            const variantsToCreate = variants.map(v => ({
              productId: productId,
              variantType: v.variantType,
              variantValue: v.variantValue,
              additionalPrice: v.additionalPrice,
              stock: v.stock,
              active: true,
            }));
            await productsApi.createVariantsBulk(variantsToCreate);
            toast.success(`${variants.length} variante(s) agregada(s).`);
          } catch (error) {
            variantErrors.push('Error al crear nuevas variantes');
            console.error('Error creating variants:', error);
          }
        }

        // Show summary of variant errors if any
        if (variantErrors.length > 0) {
          toast.error(`Algunos cambios de variantes fallaron: ${variantErrors.length} error(es)`);
          console.error('Variant operation errors:', variantErrors);
        }
      }

      onClose();
    } catch (error) {
      if (isSubscriptionLimitError(error)) {
        const errorInfo = parseSubscriptionError(error);
        setLimitError(errorInfo);
      } else {
        toast.error('Error: ' + error.message);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          toast.loading('Subiendo imagen...');
          const result = await uploadApi.uploadImage(file);
          setValue('ruta', result.url);
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

  // Group variants by type for display
  const groupedExistingVariants = existingVariants.reduce((acc, variant) => {
    if (!acc[variant.variantType]) {
      acc[variant.variantType] = [];
    }
    acc[variant.variantType].push(variant);
    return acc;
  }, {});

  const groupedNewVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.variantType]) {
      acc[variant.variantType] = [];
    }
    acc[variant.variantType].push(variant);
    return acc;
  }, {});

  return (
    <>
      <SubscriptionLimitModal
        isOpen={!!limitError}
        onClose={() => {
          setLimitError(null);
          onClose();
        }}
        title={limitError?.title}
        message={limitError?.message}
        type={limitError?.type}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#121516] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic product fields */}
            <input {...register('nombre', { required: 'Nombre requerido' })} placeholder="Nombre" className="w-full p-2 bg-[#171819] text-white rounded" />
            <textarea {...register('description')} placeholder="Descripción" className="w-full p-2 bg-[#171819] text-white rounded h-20" />
            
            <div className="grid grid-cols-2 gap-4">
              <input {...register('precio', { required: true, min: 0 })} type="number" step="0.01" placeholder="Precio base" className="w-full p-2 bg-[#171819] text-white rounded" />
              <input {...register('stock', { required: true, min: 0 })} type="number" placeholder="Stock base" className="w-full p-2 bg-[#171819] text-white rounded" />
            </div>
            
            <input {...register('category')} placeholder="Categoría (ej: Ropa, Accesorios)" className="w-full p-2 bg-[#171819] text-white rounded" />
            
            {/* Image upload */}
            <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-4 rounded cursor-pointer hover:border-gray-500 transition-colors">
              <input {...getInputProps()} />
              <p className="text-gray-400 text-center">Arrastra imagen o clic para subir</p>
              {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover mt-2 rounded" />}
            </div>

            {/* Variants section toggle */}
            <div className="border-t border-gray-700 pt-4">
              <button
                type="button"
                onClick={() => setShowVariants(!showVariants)}
                className="flex items-center gap-2 text-[#f24427] hover:text-[#ff5a40] transition-colors"
              >
                <Tags size={18} />
                {showVariants ? 'Ocultar Variantes' : 'Agregar Variantes (Talla, Color, etc.)'}
              </button>
            </div>

            {/* Variants management section */}
            {showVariants && (
              <div className="bg-[#0d0e0f] p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-300 flex items-center gap-2">
                  <Tags size={16} />
                  Gestión de Variantes
                </h4>

                {/* Loading indicator */}
                {loadingVariants && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin" size={16} />
                    Cargando variantes...
                  </div>
                )}

                {/* Existing variants (when editing) */}
                {Object.keys(groupedExistingVariants).length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-sm text-gray-400">Variantes existentes:</h5>
                    {Object.entries(groupedExistingVariants).map(([type, typeVariants]) => (
                      <div key={type} className="bg-[#171819] p-3 rounded">
                        <div className="text-sm font-medium text-[#f24427] mb-2">{type}</div>
                        <div className="space-y-2">
                          {typeVariants.map((variant) => (
                            <div key={variant.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="text"
                                value={variant.variantValue}
                                onChange={(e) => handleUpdateExistingVariant(variant.id, 'variantValue', e.target.value)}
                                className="flex-1 p-1 bg-[#0d0e0f] text-white rounded text-sm"
                                placeholder="Valor"
                              />
                              <input
                                type="number"
                                value={variant.additionalPrice}
                                onChange={(e) => handleUpdateExistingVariant(variant.id, 'additionalPrice', e.target.value)}
                                className="w-20 p-1 bg-[#0d0e0f] text-white rounded text-sm"
                                placeholder="+$"
                                step="0.01"
                              />
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => handleUpdateExistingVariant(variant.id, 'stock', e.target.value)}
                                className="w-16 p-1 bg-[#0d0e0f] text-white rounded text-sm"
                                placeholder="Stock"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingVariant(variant.id)}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* New variants to be added */}
                {Object.keys(groupedNewVariants).length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-sm text-gray-400">Nuevas variantes:</h5>
                    {Object.entries(groupedNewVariants).map(([type, typeVariants]) => (
                      <div key={type} className="bg-[#171819] p-3 rounded">
                        <div className="text-sm font-medium text-green-400 mb-2">{type} (nuevo)</div>
                        <div className="space-y-2">
                          {typeVariants.map((variant) => (
                            <div key={variant.tempId} className="flex items-center gap-2 text-sm">
                              <span className="flex-1 p-1 text-white">{variant.variantValue}</span>
                              <span className="w-20 p-1 text-gray-400">+${variant.additionalPrice}</span>
                              <span className="w-16 p-1 text-gray-400">x{variant.stock}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewVariant(variant.tempId)}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new variant form */}
                <div className="border-t border-gray-700 pt-4">
                  <h5 className="text-sm text-gray-400 mb-2">Agregar nueva variante:</h5>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-xs text-gray-500">Tipo de variante</label>
                      <select
                        value={newVariantType}
                        onChange={(e) => setNewVariantType(e.target.value)}
                        className="w-full p-2 bg-[#171819] text-white rounded text-sm"
                      >
                        <option value="">Selecciona o escribe...</option>
                        {VARIANT_TYPE_SUGGESTIONS.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newVariantType}
                        onChange={(e) => setNewVariantType(e.target.value)}
                        className="w-full p-2 bg-[#171819] text-white rounded text-sm mt-1"
                        placeholder="O escribe un tipo personalizado"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Valor</label>
                      <input
                        type="text"
                        value={newVariantValue}
                        onChange={(e) => setNewVariantValue(e.target.value)}
                        className="w-full p-2 bg-[#171819] text-white rounded text-sm"
                        placeholder="Ej: S, M, L, Rojo, Azul"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="text-xs text-gray-500">Precio adicional ($)</label>
                      <input
                        type="number"
                        value={newVariantPrice}
                        onChange={(e) => setNewVariantPrice(e.target.value)}
                        className="w-full p-2 bg-[#171819] text-white rounded text-sm"
                        placeholder="0"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Stock</label>
                      <input
                        type="number"
                        value={newVariantStock}
                        onChange={(e) => setNewVariantStock(e.target.value)}
                        className="w-full p-2 bg-[#171819] text-white rounded text-sm"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="w-full p-2 bg-[#f24427] text-white rounded text-sm hover:bg-[#d6331a] transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={16} /> Agregar
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tip: Agrega múltiples valores para el mismo tipo (ej: varias tallas).
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-700">
              <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ProductForm;