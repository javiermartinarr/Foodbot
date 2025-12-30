import { useState } from 'react'
import RestaurantModal from './RestaurantModal'

// Función para obtener color de fondo según puntuación
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

// Icono de Top Pick
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

function Explorar({ restaurantes, loading }) {
  const [selectedRestaurante, setSelectedRestaurante] = useState(null)
  const [filtros, setFiltros] = useState({
    tipo_comida: '',
    barrio: '',
    precio_categoria: '',
    busqueda: '',
    puntuacion_min: '',
    ordenar: 'puntuacion'
  })

  // Filtrar y ordenar restaurantes
  const restaurantesFiltrados = restaurantes
    .filter(r => {
      if (filtros.tipo_comida && r.tipo_comida !== filtros.tipo_comida) return false
      if (filtros.barrio && r.barrio !== filtros.barrio) return false
      if (filtros.precio_categoria && r.precio_categoria !== filtros.precio_categoria) return false
      if (filtros.puntuacion_min && (r.puntuacion || 0) < parseFloat(filtros.puntuacion_min)) return false
      if (filtros.busqueda && !r.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (filtros.ordenar) {
        case 'puntuacion':
          return (b.puntuacion || 0) - (a.puntuacion || 0)
        case 'nombre':
          return a.nombre.localeCompare(b.nombre)
        case 'precio_asc':
          return (a.precio_min || 0) - (b.precio_min || 0)
        case 'precio_desc':
          return (b.precio_min || 0) - (a.precio_min || 0)
        default:
          return 0
      }
    })

  const tiposComida = [...new Set(restaurantes.map(r => r.tipo_comida))].filter(Boolean).sort()
  const barrios = [...new Set(restaurantes.map(r => r.barrio))].filter(Boolean).sort()
  const precios = ['$', '$$', '$$$', '$$$$']

  const hayFiltrosActivos = filtros.tipo_comida || filtros.barrio || filtros.precio_categoria || filtros.busqueda || filtros.puntuacion_min

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Filtros */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/50 p-6 mb-8">
        {/* Buscador grande */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar restaurante..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:bg-white transition-all text-[#1F2937] placeholder-gray-400"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>
        </div>

        {/* Filtros en grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            className="px-4 py-3 bg-gray-50 border-[0.5px] border-[#D97706]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all text-[#1F2937] text-sm font-medium cursor-pointer hover:bg-[#FFF7ED]"
            value={filtros.tipo_comida}
            onChange={(e) => setFiltros({...filtros, tipo_comida: e.target.value})}
          >
            <option value="">🍽️ Tipo de comida</option>
            {tiposComida.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          <select
            className="px-4 py-3 bg-gray-50 border-[0.5px] border-[#D97706]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all text-[#1F2937] text-sm font-medium cursor-pointer hover:bg-[#FFF7ED]"
            value={filtros.barrio}
            onChange={(e) => setFiltros({...filtros, barrio: e.target.value})}
          >
            <option value="">📍 Barrio</option>
            {barrios.map(barrio => (
              <option key={barrio} value={barrio}>{barrio}</option>
            ))}
          </select>

          <select
            className="px-4 py-3 bg-gray-50 border-[0.5px] border-[#D97706]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all text-[#1F2937] text-sm font-medium cursor-pointer hover:bg-[#FFF7ED]"
            value={filtros.precio_categoria}
            onChange={(e) => setFiltros({...filtros, precio_categoria: e.target.value})}
          >
            <option value="">💰 Precio</option>
            {precios.map(precio => (
              <option key={precio} value={precio}>{precio}</option>
            ))}
          </select>

          <select
            className="px-4 py-3 bg-gray-50 border-[0.5px] border-[#D97706]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all text-[#1F2937] text-sm font-medium cursor-pointer hover:bg-[#FFF7ED]"
            value={filtros.puntuacion_min}
            onChange={(e) => setFiltros({...filtros, puntuacion_min: e.target.value})}
          >
            <option value="">⭐ Puntuación</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
            <option value="3">3.0+</option>
          </select>

          <select
            className="px-4 py-3 bg-gray-50 border-[0.5px] border-[#D97706]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all text-[#1F2937] text-sm font-medium cursor-pointer hover:bg-[#FFF7ED]"
            value={filtros.ordenar}
            onChange={(e) => setFiltros({...filtros, ordenar: e.target.value})}
          >
            <option value="puntuacion">↓ Mejor valorados</option>
            <option value="nombre">A-Z Nombre</option>
            <option value="precio_asc">↑ Precio: menor</option>
            <option value="precio_desc">↓ Precio: mayor</option>
          </select>

          {hayFiltrosActivos && (
            <button
              onClick={() => setFiltros({ tipo_comida: '', barrio: '', precio_categoria: '', busqueda: '', puntuacion_min: '', ordenar: 'puntuacion' })}
              className="px-4 py-3 bg-[#D97706] text-white rounded-2xl text-sm font-medium hover:bg-[#D97706]/90 active:scale-95 transition-all"
            >
              ✕ Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-gray-500 mb-4">
        {restaurantesFiltrados.length} de {restaurantes.length} restaurantes
      </p>

      {/* Lista de restaurantes */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : restaurantesFiltrados.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-500 text-lg">No hay restaurantes que coincidan</p>
          <button
            onClick={() => setFiltros({ tipo_comida: '', barrio: '', precio_categoria: '', busqueda: '', puntuacion_min: '', ordenar: 'puntuacion' })}
            className="mt-4 text-gray-900 font-medium hover:underline"
          >
            Ver todos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurantesFiltrados.map(restaurante => (
            <article
              key={restaurante.id}
              onClick={() => setSelectedRestaurante(restaurante)}
              className="group bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 relative"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1F2937] text-base truncate group-hover:text-gray-700 transition-colors" style={{ fontFamily: 'Merriweather, serif' }}>
                    {restaurante.nombre}
                  </h3>
                  <p className="text-xs text-[#1F2937] mt-0.5">
                    {restaurante.tipo_comida} {restaurante.subtipo_comida && `· ${restaurante.subtipo_comida}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {restaurante.destacado && (
                    <div className="bg-[#D97706] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      ⭐ Top Pick
                    </div>
                  )}
                  <div className={`flex items-center gap-1 ${getScoreGradient(restaurante.puntuacion)} text-[#1F2937] px-2.5 py-1 rounded-lg`}>
                    {restaurante.destacado ? (
                      <TopChoiceIcon className="w-3 h-3 text-[#D97706]" />
                    ) : (
                      <span className="text-xs" style={{ color: '#D97706' }}>⭐</span>
                    )}
                    <span className="font-semibold text-xs">{restaurante.puntuacion?.toFixed(1) || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="inline-flex items-center gap-1 bg-gray-100 text-[#1F2937] text-xs px-2 py-1 rounded-full font-medium">
                  📍 {restaurante.barrio}
                </span>
                <span className="inline-flex items-center gap-1 bg-gray-100 text-[#1F2937] text-xs px-2 py-1 rounded-full font-medium">
                  {restaurante.precio_categoria}
                  {restaurante.precio_min && restaurante.precio_max && (
                    <span className="ml-1 text-[#1F2937]">
                      ({restaurante.precio_min}-{restaurante.precio_max}€)
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 bg-gray-100 text-[#1F2937] text-xs px-2 py-1 rounded-full font-medium">
                  {restaurante.ambiente}
                </span>
              </div>

              {restaurante.tags && restaurante.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {restaurante.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {restaurante.mejor_para && restaurante.mejor_para.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {restaurante.mejor_para.slice(0, 2).map((ocasion, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                      {ocasion}
                    </span>
                  ))}
                </div>
              )}

              {restaurante.plato_recomendado && (
                <div className="bg-amber-50 rounded-xl p-2 mb-3">
                  <p className="text-xs text-amber-600 font-medium mb-0.5">Recomendación</p>
                  <p className="text-xs text-amber-900 font-medium">{restaurante.plato_recomendado}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {restaurante.requiere_reserva ? (
                    <span className="text-amber-600 font-medium">⚠️ Requiere reserva</span>
                  ) : restaurante.acepta_reservas ? (
                    '✓ Acepta reservas'
                  ) : (
                    'Sin reservas'
                  )}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                  Ver más →
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de detalle - Usando componente reutilizable */}
      <RestaurantModal 
        restaurante={selectedRestaurante} 
        onClose={() => setSelectedRestaurante(null)} 
      />
    </div>
  )
}

export default Explorar