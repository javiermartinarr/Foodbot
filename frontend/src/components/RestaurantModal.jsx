import React from 'react'

// Score gradient - SIN CAMBIOS
function getScoreGradient(score) {
  if (!score) return 'bg-gray-300 border-[0.5px] border-gray-400'
  
  if (score >= 4.5) {
    return 'bg-green-200 border-[0.5px] border-gray-400'
  } else if (score >= 4.0) {
    return 'bg-green-100 border-[0.5px] border-gray-400'
  } else if (score >= 3.5) {
    return 'bg-amber-200 border-[0.5px] border-gray-400'
  } else if (score >= 3.0) {
    return 'bg-orange-200 border-[0.5px] border-gray-400'
  } else {
    return 'bg-gray-200 border-[0.5px] border-gray-400'
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

  // --- ESTILOS UNIFICADOS ---
  const modalBgStyle = { backgroundColor: 'var(--card-bg)' }
  const textTitleStyle = { color: 'var(--card-title)' }
  const textSubtitleStyle = { color: 'var(--card-subtitle)' }
  
  // Estilo de caja con borde sutil (Diseño nuevo)
  const boxStyle = { 
    backgroundColor: 'var(--filter-bg)',
    border: '1px solid var(--card-border)' 
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto transition-colors duration-300"
        style={modalBgStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
            className="sticky top-0 border-b p-6 flex justify-between items-start z-10 backdrop-blur-md"
            style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)' 
            }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold" style={{ ...textTitleStyle, fontFamily: 'Merriweather, serif' }}>
                {restaurante.nombre}
              </h2>
              {restaurante.destacado && (
                <span className="bg-[#D97706] text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
                  ⭐ Top Pick
                </span>
              )}
            </div>
            <p className="mt-1" style={textSubtitleStyle}>
              {restaurante.tipo_comida} {restaurante.subtipo_comida && `· ${restaurante.subtipo_comida}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-70 hover:scale-105 active:scale-95"
            style={{ 
                backgroundColor: 'var(--filter-bg)',
                color: 'var(--card-title)',
                border: '1px solid var(--card-border)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          
          {/* Puntuación y precio */}
          <div className="flex items-center gap-5">
            <div className={`${getScoreGradient(restaurante.puntuacion)} text-[#1F2937] px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm`}>
              {restaurante.destacado ? (
                <TopChoiceIcon className="w-5 h-5 text-[#D97706]" />
              ) : (
                <span className="text-xl" style={{ color: '#D97706' }}>⭐</span>
              )}
              <div className="leading-tight">
                <span className="text-3xl font-bold tracking-tight">{restaurante.puntuacion?.toFixed(1) || '-'}</span>
                <span className="text-xs font-semibold ml-1 opacity-60">/ 5.0</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold border w-fit" 
                style={{ 
                    color: 'var(--card-title)', 
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--filter-bg)'
                }}>
                {restaurante.precio_categoria}
              </span>
              <p className="text-sm font-medium" style={textSubtitleStyle}>
                {restaurante.precio_min && restaurante.precio_max 
                  ? `${restaurante.precio_min}-${restaurante.precio_max}€ por persona`
                  : 'Precio no especificado'}
              </p>
            </div>
          </div>
          
          {/* Links Principales */}
          {(restaurante.url_web || restaurante.url_carta) && (
            <div className="w-full">
              {restaurante.url_web && (
                <a
                  href={restaurante.url_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full text-base font-medium rounded-xl px-4 py-2.5 mb-2 transition-all hover:brightness-105 active:scale-[0.99]"
                  style={{ 
                      color: '#D97706',
                      backgroundColor: 'rgba(217, 119, 6, 0.1)',
                      border: '1px solid rgba(217, 119, 6, 0.2)'
                  }}
                >
                  🌐 Web oficial
                </a>
              )}
            </div>
          )}

          {/* Descripción - Texto original restaurado */}
          {restaurante.descripcion_personal && (
            <div className="rounded-2xl p-5 w-full shadow-sm" style={boxStyle}>
              <p className="text-sm font-medium mb-2 opacity-90" style={textSubtitleStyle}>Descripción general</p>
              <p className="leading-relaxed text-sm" style={textTitleStyle}>{restaurante.descripcion_personal}</p>
            </div>
          )}

          {/* GRID: Recomendación y Ambiente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recomendación - Texto original restaurado */}
            {restaurante.plato_recomendado ? (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
                <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mb-1">⭐ Recomendación</p>
                <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">{restaurante.plato_recomendado}</p>
              </div>
            ) : <div/>}
            
            {/* Ambiente - Texto original restaurado */}
            <div className="rounded-2xl p-4" style={boxStyle}>
              <p className="text-xs mb-1 opacity-90" style={textSubtitleStyle}>✨ Ambiente</p>
              <p className="text-sm font-medium" style={textTitleStyle}>{restaurante.ambiente}</p>
            </div>
          </div>

          {/* GRID: Ubicación y Reservas - Textos originales restaurados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={boxStyle}>
              <p className="text-xs mb-1 opacity-90" style={textSubtitleStyle}>📍 Ubicación</p>
              <p className="text-sm font-medium" style={textTitleStyle}>{restaurante.barrio}</p>
              <p className="text-xs mt-1 opacity-80" style={textSubtitleStyle}>{restaurante.direccion}</p>
            </div>
            <div className="rounded-2xl p-4" style={boxStyle}>
              <p className="text-xs mb-1 opacity-90" style={textSubtitleStyle}>📞 Reservas</p>
              <p className="text-sm font-medium" style={textTitleStyle}>
                {restaurante.requiere_reserva 
                  ? '⚠️ Requiere reserva' 
                  : restaurante.acepta_reservas 
                    ? '✓ Acepta reservas' 
                    : 'No acepta reservas'}
              </p>
            </div>
          </div>

          {/* Ideal para - Texto original restaurado */}
          {restaurante.mejor_para && restaurante.mejor_para.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={textSubtitleStyle}>Ideal para</p>
              <div className="flex flex-wrap gap-2">
                {restaurante.mejor_para.map(ocasion => (
                  <span key={ocasion} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 text-sm px-3 py-1.5 rounded-full font-medium transition-colors">
                    {ocasion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Características - Texto original restaurado */}
          {restaurante.tags && restaurante.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={textSubtitleStyle}>Características</p>
              <div className="flex flex-wrap gap-2">
                {restaurante.tags.map((tag, idx) => (
                  <span key={idx} 
                    className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 text-sm px-3 py-1.5 rounded-full font-medium transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Botones */}
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
            {restaurante.url_carta && (
              <a 
                href={restaurante.url_carta} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 text-center py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all hover:brightness-110 shadow-md"
                style={{ 
                    backgroundColor: '#D97706',
                    color: '#FFFFFF'
                }}
              >
                Ver carta
              </a>
            )}
            {restaurante.google_maps_url && (
              <a 
                href={restaurante.google_maps_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 text-center py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all hover:bg-opacity-80 border"
                style={{ 
                    backgroundColor: 'var(--filter-bg)',
                    color: 'var(--card-title)',
                    borderColor: 'var(--card-border)'
                }}
              >
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