import { useState, useEffect, useMemo } from 'react';
import { X, Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { productsApi } from '../api/products';

/**
 * ProductDetailModal - Modal for viewing product details and selecting variants before adding to cart
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.product - The product to display
 * @param {string} props.clientName - Optional client/store name
 * @param {string} props.clientColor - Optional client/store color
 */
function ProductDetailModal({ isOpen, onClose, product, clientName, clientColor }) {
  const { addItem } = useCartStore();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load variants when product changes
  useEffect(() => {
    if (isOpen && product?.id) {
      const fetchVariants = async () => {
        try {
          setLoading(true);
          const productVariants = await productsApi.getVariants(product.id);
          setVariants(productVariants || []);
          // Reset selections when product changes
          setSelectedVariants({});
          setQuantity(1);
        } catch (error) {
          console.error('Error loading variants:', error);
          setVariants([]);
        } finally {
          setLoading(false);
        }
      };
      fetchVariants();
    }
  }, [isOpen, product?.id]);

  // Group variants by type
  const variantsByType = useMemo(() => {
    const grouped = {};
    variants.forEach((variant) => {
      if (!grouped[variant.variantType]) {
        grouped[variant.variantType] = [];
      }
      grouped[variant.variantType].push(variant);
    });
    return grouped;
  }, [variants]);

  // Check if all variant types have a selection
  const hasVariants = Object.keys(variantsByType).length > 0;
  const allVariantsSelected = Object.keys(variantsByType).every(
    (type) => selectedVariants[type]
  );

  // Calculate total price with variant adjustments
  const totalPrice = useMemo(() => {
    const basePrice = Number(product?.precio || 0);
    const variantAdjustments = Object.values(selectedVariants).reduce(
      (sum, variant) => sum + Number(variant?.additionalPrice || 0),
      0
    );
    return (basePrice + variantAdjustments) * quantity;
  }, [product?.precio, selectedVariants, quantity]);

  // Get the selected variant's stock (or product stock if no variants)
  const availableStock = useMemo(() => {
    if (!hasVariants) {
      return product?.stock || 0;
    }
    // For variants, use the minimum stock of all selected variants
    const selectedVariantsList = Object.values(selectedVariants);
    if (selectedVariantsList.length === 0) return 0;
    return Math.min(...selectedVariantsList.map((v) => v.stock || 0));
  }, [hasVariants, selectedVariants, product?.stock]);

  const handleVariantSelect = (type, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [type]: variant,
    }));
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > availableStock && availableStock > 0) return availableStock;
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (hasVariants && !allVariantsSelected) {
      alert('Por favor selecciona todas las opciones del producto');
      return;
    }

    if (availableStock <= 0) {
      alert('Sin stock disponible');
      return;
    }

    setAddingToCart(true);

    try {
      // Build variant info string
      const variantInfo = Object.entries(selectedVariants)
        .map(([type, variant]) => `${type}: ${variant.variantValue}`)
        .join(', ');

      // Create cart item with variant information
      const cartItem = {
        id: hasVariants 
          ? `${product.id}-${Object.values(selectedVariants).map(v => v.id).join('-')}`
          : product.id,
        productId: product.id,
        ruta: product.ruta,
        nombre: product.nombre,
        precio: Number(product.precio) + Object.values(selectedVariants).reduce(
          (sum, v) => sum + Number(v.additionalPrice || 0), 0
        ),
        description: product.description,
        stock: availableStock,
        clientName,
        variantInfo: variantInfo || null,
        variantIds: Object.values(selectedVariants).map(v => v.id),
      };

      // Add item to cart with the selected quantity
      addItem(cartItem, quantity);

      // Show success feedback
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  if (!isOpen) return null;

  const brandColor = clientColor || '#f24427';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#171819] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          {/* Product image */}
          <div className="w-full md:w-1/2 p-4 flex items-center justify-center bg-[#0d0e0f]">
            <img
              src={product?.ruta || 'https://via.placeholder.com/400'}
              alt={product?.nombre || 'Producto'}
              className="w-full h-64 md:h-80 object-cover rounded-xl"
            />
          </div>

          {/* Product details */}
          <div className="w-full md:w-1/2 p-6 flex flex-col">
            {/* Client badge */}
            {clientName && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 w-fit"
                style={{
                  backgroundColor: `${brandColor}20`,
                  border: `1px solid ${brandColor}`,
                  color: brandColor,
                }}
              >
                🏪 {clientName}
              </div>
            )}

            {/* Product name */}
            <h2 className="text-2xl font-bold text-white mb-2">
              {product?.nombre || 'Producto'}
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4">
              {product?.description || 'Sin descripción'}
            </p>

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold" style={{ color: brandColor }}>
                ${(totalPrice / quantity).toFixed(2)}
              </span>
              {hasVariants && Object.values(selectedVariants).some(v => v.additionalPrice > 0) && (
                <span className="text-sm text-gray-500 ml-2">
                  (Base: ${Number(product?.precio || 0).toFixed(2)})
                </span>
              )}
            </div>

            {/* Variants section */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-gray-400" size={24} />
                <span className="ml-2 text-gray-400">Cargando opciones...</span>
              </div>
            ) : hasVariants ? (
              <div className="space-y-4 mb-4">
                {Object.entries(variantsByType).map(([type, typeVariants]) => (
                  <div key={type}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {type}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {typeVariants.map((variant) => {
                        const isSelected = selectedVariants[type]?.id === variant.id;
                        const isOutOfStock = variant.stock <= 0;

                        return (
                          <button
                            key={variant.id}
                            onClick={() => !isOutOfStock && handleVariantSelect(type, variant)}
                            disabled={isOutOfStock}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isOutOfStock
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : isSelected
                                ? 'text-white'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                            style={isSelected && !isOutOfStock ? { backgroundColor: brandColor } : {}}
                          >
                            {variant.variantValue}
                            {variant.additionalPrice > 0 && (
                              <span className="ml-1 text-xs opacity-70">
                                (+${Number(variant.additionalPrice).toFixed(2)})
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="ml-1 text-xs">(Agotado)</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-4">
                Stock disponible: {product?.stock || 0} unidades
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-400">Cantidad:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-white font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  disabled={quantity >= availableStock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4 p-3 bg-black/30 rounded-lg">
              <span className="text-gray-400">Total:</span>
              <span className="text-xl font-bold" style={{ color: brandColor }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={
                (hasVariants && !allVariantsSelected) ||
                availableStock <= 0 ||
                addingToCart
              }
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                (hasVariants && !allVariantsSelected) || availableStock <= 0
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'hover:scale-[1.02]'
              }`}
              style={
                !((hasVariants && !allVariantsSelected) || availableStock <= 0)
                  ? { backgroundColor: brandColor }
                  : {}
              }
            >
              {addingToCart ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Agregando...
                </>
              ) : availableStock <= 0 ? (
                'Sin Stock'
              ) : hasVariants && !allVariantsSelected ? (
                'Selecciona las opciones'
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Agregar al Carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
