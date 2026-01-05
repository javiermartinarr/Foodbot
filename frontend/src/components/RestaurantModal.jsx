function getScoreGradient(score) {
  if (!score) return 'bg-gray-300 dark:bg-gray-600 border-[0.5px] border-gray-400 dark:border-gray-500'
  
  if (score >= 4.5) {
    return 'bg-green-200 dark:bg-green-900 border-[0.5px] border-gray-400 dark:border-green-700'
  } else if (score >= 4.0) {
    return 'bg-green-100 dark:bg-green-900/70 border-[0.5px] border-gray-400 dark:border-green-700'
  } else if (score >= 3.5) {
    return 'bg-amber-200 dark:bg-amber-900 border-[0.5px] border-gray-400 dark:border-amber-700'
  } else if (score >= 3.0) {
    return 'bg-orange-200 dark:bg-orange-900 border-[0.5px] border-gray-400 dark:border-orange-700'
  } else {
    return 'bg-gray-200 dark:bg-gray-700 border-[0.5px] border-gray-400 dark:border-gray-500'
  }
}

function TopChoiceIcon({ className }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M8 1L9.5 6L14 6.5L10.5 10L11.5 14.5L8 12L4.5 14.5L5.5 10L2 6.5L6.5 6L8 1Z" 
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  )
}

function RestaurantModal({ restaurante, onClose }) {
  if (!restaurante) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-dark-bg rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-bg rounded-t-3xl border-b border-gray-100 dark:border-dark-border p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-[#1F2937] dark:text-dark-text" style={{ fontFamily: 'Merriweather, serif' }}>
                {restaurante.nombre}
              </h2>
              {restaurante.destacado && (
                <span className="bg-[#D97706] text-white text-xs px-2 py-1 rounded-full font-semibold">
                  ⭐ Top Pick
                </span>
              )}
            </div>
            <p className="text-[#1F2937] dark:text-dark-muted mt-1">
              {restaurante.tipo_comida} {restaurante.subtipo_comida && `· ${restaurante.subtipo_comida}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors text-[#1F2937] dark:text-dark-text"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Puntuación y precio */}
          <div className="flex items-center gap-4">
            <div className={`${getScoreGradient(restaurante.puntuacion)} text-[#1F2937] dark:text-dark-text px-5 py-3 rounded-2xl flex items-center gap-2`}>
              {restaurante.destacado ? (
                <TopChoiceIcon className="w-4 h-4 text-[#D97706]" />
              ) : (
                <span className="text-lg" style={{ color: '#D97706' }}>⭐</span>
              )}
              <div>
                <span className="text-3xl font-bold">{restaurante.puntuacion?.toFixed(1) || '-'}</span>
                <span className="text-sm ml-1">/ 5.0</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-[#1F2937] dark:text-dark-text">{restaurante.precio_categoria}</p>
              <p className="text-sm text-[#1F2937] dark:text-dark-muted">
                {restaurante.precio_min && restaurante.precio_max 
                  ? `${restaurante.precio_min}-${restaurante.precio_max}€ por persona`
                  : 'Precio no especificado'}
              </p>
            </div>
          </div>
          
          {/* Links */}
          {(restaurante.url_web || restaurante.url_carta) && (
            <div className="w-full">
              {restaurante.url_web && (
                <a
                  href={restaurante.url_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-base font-medium text-[#D97706] underline hover:no-underline bg-[#FFF7ED] dark:bg-amber-900/30 rounded-xl px-4 py-2 mb-2"
                >
                  🌐 Web oficial
                </a>
              )}
            </div>
          )}

          {/* Descripción */}
          {restaurante.descripcion_personal && (
            <div className="bg-[#EDEDED] dark:bg-dark-border rounded-2xl p-4 w-full">
              <p className="text-sm text-[#1F2937] dark:text-dark-muted font-medium mb-2">Descripción general</p>
              <p className="text-[#1F2937] dark:text-dark-text leading-relaxed text-sm">{restaurante.descripcion_personal}</p>
            </div>
          )}

          {/* Plato y ambiente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurante.plato_recomendado ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 dark:border dark:border-amber-800/30 rounded-2xl p-4">
                <p className="text-xs text-amber-600 dark:text-amber-300 font-medium mb-0.5">⭐ Recomendación</p>
                <p className="text-xs text-amber-900 dark:text-amber-100 font-medium">{restaurante.plato_recomendado}</p>
              </div>
            ) : (
              <div></div>
            )}
            <div className="bg-gray-50 dark:bg-dark-border rounded-2xl p-4">
              <p className="text-xs text-[#1F2937] dark:text-dark-muted mb-1">✨ Ambiente</p>
              <p className="text-sm font-medium text-[#1F2937] dark:text-dark-text">{restaurante.ambiente}</p>
            </div>
          </div>

          {/* Ubicación y reservas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-dark-border rounded-2xl p-4">
              <p className="text-xs text-[#1F2937] dark:text-dark-muted mb-1">📍 Ubicación</p>
              <p className="text-sm font-medium text-[#1F2937] dark:text-dark-text">{restaurante.barrio}</p>
              <p className="text-xs text-[#1F2937] dark:text-dark-muted mt-1">{restaurante.direccion}</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-border rounded-2xl p-4">
              <p className="text-xs text-[#1F2937] dark:text-dark-muted mb-1">📞 Reservas</p>
              <p className="text-sm font-medium text-[#1F2937] dark:text-dark-text">
                {restaurante.requiere_reserva 
                  ? '⚠️ Requiere reserva' 
                  : restaurante.acepta_reservas 
                    ? '✓ Acepta reservas' 
                    : 'No acepta reservas'}
              </p>
            </div>
          </div>

          {/* Mejor para */}
          {restaurante.mejor_para && restaurante.mejor_para.length > 0 && (
            <div>
              <p className="text-sm text-[#1F2937] dark:text-dark-muted font-medium mb-2">Ideal para</p>
              <div className="flex flex-wrap gap-2">
                {restaurante.mejor_para.map(ocasion => (
                  <span key={ocasion} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-3 py-1.5 rounded-full font-medium">
                    {ocasion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {restaurante.tags && restaurante.tags.length > 0 && (
            <div>
              <p className="text-sm text-[#1F2937] dark:text-dark-muted font-medium mb-2">Características</p>
              <div className="flex flex-wrap gap-2">
                {restaurante.tags.map((tag, idx) => (
                  <span key={idx} className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm px-3 py-1.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            {restaurante.url_carta && (
              <a href={restaurante.url_carta} target="_blank" rel="noopener noreferrer" className="flex-1 bg-black dark:bg-white text-white dark:text-black text-center py-3.5 rounded-2xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98] transition-all">
                Ver carta
              </a>
            )}
            {restaurante.google_maps_url && (
              <a href={restaurante.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-100 dark:bg-dark-border text-[#1F2937] dark:text-dark-text text-center py-3.5 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-dark-bg active:scale-[0.98] transition-all">
                Cómo llegar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantModal