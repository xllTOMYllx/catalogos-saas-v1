import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import ProductDetailModal from './ProductDetailModal';

function ProductCard({ id, ruta, nombre, precio, description, stock, clientName, clientColor }) {
  const { addItem } = useCartStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (stock > 0) {
      addItem({ id, ruta, nombre, precio, description, stock, clientName });
    } else {
      alert('Sin stock disponible');
    }
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Helper to create a transparent version of the color
  const getBackgroundColor = (color) => {
    if (!color) return 'rgba(242, 68, 39, 0.125)'; // default fallback
    // Handle hex colors
    if (color.startsWith('#')) {
      return color + '20'; // Add alpha to hex
    }
    // Handle rgb/rgba colors - convert to rgba with alpha
    if (color.startsWith('rgb')) {
      return color.replace('rgb(', 'rgba(').replace(')', ', 0.125)');
    }
    // Fallback
    return color + '20';
  };

  const product = { id, ruta, nombre, precio, description, stock };

  return (
    <>
      <article 
        className="flex flex-col w-full max-w-xs bg-[#171819] gap-2 items-center rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer hover:ring-2 hover:ring-[#f24427]/50"
        onClick={handleCardClick}
      >
        <img src={ruta} alt={nombre} className="w-full h-48 object-cover rounded-lg" />
        {clientName && clientColor && (
          <div className="w-full flex items-center justify-center gap-2 py-1 px-3 rounded-full" style={{ backgroundColor: getBackgroundColor(clientColor), border: `1px solid ${clientColor}` }}>
            <span className="text-xs font-medium" style={{ color: clientColor }}>
              🏪 {clientName}
            </span>
          </div>
        )}
        <h3 className="text-xl font-semibold text-white text-center">{nombre}</h3>
        <p className="text-gray-400 text-xs sm:text-sm text-center line-clamp-2">{description}</p>
        <p className="text-2xl font-bold text-[#f24427]">${precio}</p>
        {stock > 0 ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#ab1a00] hover:bg-[#8f1600] text-white py-3 sm:py-2 text-sm font-semibold rounded-md transition-all hover:scale-105 min-h-[48px]"  // min-h para touch 48px
          >
            AGREGAR AL CARRITO
          </button>
        ) : (
          <button disabled className="w-full bg-gray-500 text-white py-2 rounded-md">SIN STOCK</button>
        )}
      </article>

      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={product}
        clientName={clientName}
        clientColor={clientColor}
      />
    </>
  );
}

export default ProductCard;