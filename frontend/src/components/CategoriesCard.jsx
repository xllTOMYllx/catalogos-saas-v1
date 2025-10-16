function CategoriesCard({ ruta, titulo = "COLECCIÓN DE", subtitulo = "PRODUCTOS", btnText = "Ver nuevas colecciones" }) {
  return (
    <section className="w-full bg-[#121516] rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 h-auto sm:h-64">
      {/* Contenido texto —izquierda en desktop, full en mobile */}
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold font-serif text-white leading-tight mb-2 sm:mb-4">
          {titulo}
          <br className="sm:hidden" /> {/* Break solo en mobile */}
          {subtitulo}
        </h2>
        <button className="mt-3 sm:mt-4 bg-[#f24427] hover:bg-[#d6331a] text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 text-sm sm:text-base">
          {btnText}
        </button>
      </div>
      {/* Imagen —derecha en desktop, abajo en mobile */}
      <img 
        src={ruta} 
        alt="Categoría" 
        className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-48 lg:w-80 lg:h-52 object-cover rounded-xl -mr-2 sm:-mr-4 -mt-2 sm:-mt-4 self-center sm:self-end" 
      />
    </section>
  );
}

export default CategoriesCard;