import { useState } from 'react'

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
      <div className="rounded-3xl shadow-sm p-6 mb-8" style={{ backgroundColor: 'var(--filter-bg)', border: '1px solid var(--filter-border)' }}>
        {/* Buscador grande */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar restaurante..."
              className="w-full pl-12 pr-4 py-3.5 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>
        </div>

        {/* Filtros en grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            className="px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            value={filtros.tipo_comida}
            onChange={(e) => setFiltros({...filtros, tipo_comida: e.target.value})}
          >
            <option value="">Tipo de comida</option>
            {tiposComida.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          <select
            className="px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            value={filtros.barrio}
            onChange={(e) => setFiltros({...filtros, barrio: e.target.value})}
          >
            <option value="">Barrio</option>
            {barrios.map(barrio => (
              <option key={barrio} value={barrio}>{barrio}</option>
            ))}
          </select>

          <select
            className="px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            value={filtros.precio_categoria}
            onChange={(e) => setFiltros({...filtros, precio_categoria: e.target.value})}
          >
            <option value="">Precio</option>
            {precios.map(precio => (
              <option key={precio} value={precio}>{precio}</option>
            ))}
          </select>

          <select
            className="px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            value={filtros.puntuacion_min}
            onChange={(e) => setFiltros({...filtros, puntuacion_min: e.target.value})}
          >
            <option value="">Puntuación</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
            <option value="3">3.0+</option>
          </select>

          <select
            className="px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
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
              className="px-4 py-3 bg-gray-900 text-white rounded-2xl text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurantesFiltrados.map(restaurante => (
            <article
              key={restaurante.id}
              onClick={() => setSelectedRestaurante(restaurante)}
              className="group rounded-3xl shadow-sm p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate transition-colors" style={{ color: 'var(--card-title)' }}>
                    {restaurante.nombre}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--card-subtitle)' }}>
                    {restaurante.tipo_comida} {restaurante.subtipo_comida && `· ${restaurante.subtipo_comida}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-xl ml-3">
                  <span className="text-sm">⭐</span>
                  <span className="font-semibold text-sm">{restaurante.puntuacion?.toFixed(1) || '-'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                  📍 {restaurante.barrio}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                  {restaurante.precio_categoria}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                  {restaurante.ambiente}
                </span>
              </div>

              {restaurante.plato_recomendado && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 mb-4">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-0.5">Pedir sí o sí</p>
                  <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">{restaurante.plato_recomendado}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {restaurante.acepta_reservas ? '✓ Acepta reservas' : 'Sin reservas'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  Ver más →
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {selectedRestaurante && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRestaurante(null)}
        >
          <div 
            className="rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 rounded-t-3xl p-6 flex justify-between items-start" style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-divider)' }}>
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--card-title)' }}>{selectedRestaurante.nombre}</h2>
                <p className="mt-1" style={{ color: 'var(--card-subtitle)' }}>
                  {selectedRestaurante.tipo_comida} {selectedRestaurante.subtipo_comida && `· ${selectedRestaurante.subtipo_comida}`}
                </p>
              </div>
              <button 
                onClick={() => setSelectedRestaurante(null)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors dark:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl">
                  <span className="text-3xl font-bold">{selectedRestaurante.puntuacion?.toFixed(1) || '-'}</span>
                  <span className="text-gray-400 text-sm ml-1">/ 5</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRestaurante.precio_categoria}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedRestaurante.precio_min && selectedRestaurante.precio_max 
                      ? `${selectedRestaurante.precio_min}-${selectedRestaurante.precio_max}€ por persona`
                      : 'Precio no especificado'}
                  </p>
                </div>
              </div>

              {selectedRestaurante.plato_recomendado && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">⭐ Plato recomendado</p>
                  <p className="text-amber-900 dark:text-amber-200 font-semibold">{selectedRestaurante.plato_recomendado}</p>
                </div>
              )}

              {selectedRestaurante.descripcion_personal && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">Mi opinión</p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedRestaurante.descripcion_personal}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--card-meta)' }}>📍 Ubicación</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--card-title)' }}>{selectedRestaurante.barrio}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedRestaurante.direccion}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--card-meta)' }}>✨ Ambiente</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--card-title)' }}>{selectedRestaurante.ambiente}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">📞 Reservas</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedRestaurante.requiere_reserva 
                    ? '⚠️ Requiere reserva' 
                    : selectedRestaurante.acepta_reservas 
                      ? '✓ Acepta reservas' 
                      : 'No acepta reservas'}
                </p>
              </div>

              {selectedRestaurante.mejor_para && selectedRestaurante.mejor_para.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">Ideal para</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestaurante.mejor_para.map(ocasion => (
                      <span key={ocasion} className="bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full font-medium">
                        {ocasion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedRestaurante.url_carta && (
                  <a href={selectedRestaurante.url_carta} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-900 text-white text-center py-3.5 rounded-2xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all">
                    Ver carta
                  </a>
                )}
                {selectedRestaurante.google_maps_url && (
                  <a href={selectedRestaurante.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-center py-3.5 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98] transition-all">
                    Cómo llegar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Explorar