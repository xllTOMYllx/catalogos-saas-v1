import { useCartStore } from '../store/cartStore';

function ProductCard({ id, ruta, nombre, precio, description, stock }) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (stock > 0) {
      addItem({ id, ruta, nombre, precio, description, stock });
    } else {
      alert('Sin stock disponible');
    }
  };

  return (
    <article className="flex flex-col w-full max-w-xs bg-[#171819] gap-2 items-center rounded-xl p-4 hover:shadow-lg transition-shadow">
      <img src={ruta} alt={nombre} className="w-full h-48 object-cover rounded-lg" />
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
  );
}

export default ProductCard;