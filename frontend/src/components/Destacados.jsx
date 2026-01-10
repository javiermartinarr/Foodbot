import { useState } from 'react'
import RestaurantModal from './RestaurantModal'

// Configuración de categorías basadas en mejor_para
const CATEGORIAS = [
  { id: 'cita', nombre: 'Para una cita', emoji: '💑', color: '#EC4899' },
  { id: 'amigos', nombre: 'Con amigos', emoji: '👥', color: '#8B5CF6' },
  { id: 'familia', nombre: 'En familia', emoji: '👨‍👩‍👧‍👦', color: '#10B981' },
  { id: 'brunch', nombre: 'Brunch', emoji: '🍳', color: '#F59E0B' },
  { id: 'trabajo', nombre: 'Comida de trabajo', emoji: '💼', color: '#6366F1' },
  { id: 'solo', nombre: 'Para ir solo', emoji: '🧘', color: '#14B8A6' },
  { id: 'celebracion', nombre: 'Celebraciones', emoji: '🎉', color: '#EF4444' },
  { id: 'afterwork', nombre: 'Afterwork', emoji: '🍻', color: '#F97316' },
]

function Destacados({ restaurantes }) {
  const [selectedRestaurante, setSelectedRestaurante] = useState(null)
  const [showSorpresa, setShowSorpresa] = useState(false)
  const [restauranteSorpresa, setRestauranteSorpresa] = useState(null)

  // Restaurantes destacados (favoritos absolutos)
  const favoritos = restaurantes.filter(r => r.destacado)

  // Función para seleccionar restaurante aleatorio
  const sorprenderme = () => {
    // Filtrar solo los que tienen buena puntuación (3.5+)
    const buenos = restaurantes.filter(r => r.puntuacion >= 3.5)
    if (buenos.length === 0) return
    
    const aleatorio = buenos[Math.floor(Math.random() * buenos.length)]
    setRestauranteSorpresa(aleatorio)
    setShowSorpresa(true)
  }

  // Obtener restaurantes por categoría
  const getRestaurantesPorCategoria = (categoriaId) => {
    return restaurantes
      .filter(r => r.mejor_para?.includes(categoriaId))
      .sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0))
      .slice(0, 6) // Máximo 6 por categoría
  }

  // Filtrar categorías que tienen al menos un restaurante
  const categoriasConRestaurantes = CATEGORIAS.filter(
    cat => getRestaurantesPorCategoria(cat.id).length > 0
  )

  // Estilos consistentes con el resto de la app
  const cardStyle = {
    backgroundColor: 'var(--card-bg)',
    borderColor: 'var(--card-border)',
    borderWidth: '1px'
  }

  const itemStyle = {
    backgroundColor: 'var(--filter-bg)',
    borderColor: 'var(--card-divider)',
    borderWidth: '1px'
  }

  // Componente de tarjeta mini para las categorías
  const MiniCard = ({ restaurante, onClick }) => (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-64 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] border"
      style={itemStyle}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 
          className="font-semibold text-sm truncate flex-1 pr-2"
          style={{ color: 'var(--card-title)' }}
        >
          {restaurante.nombre}
        </h4>
        <span 
          className="text-xs font-bold px-2 py-0.5 rounded-lg"
          style={{ 
            backgroundColor: 'var(--badge-bg)', 
            color: 'var(--card-title)' 
          }}
        >
          {restaurante.puntuacion?.toFixed(1) || '-'}
        </span>
      </div>
      <p 
        className="text-xs truncate"
        style={{ color: 'var(--card-subtitle)' }}
      >
        {restaurante.tipo_comida} · {restaurante.barrio}
      </p>
      {restaurante.plato_recomendado && (
        <p 
          className="text-xs mt-2 truncate"
          style={{ color: 'var(--card-meta)' }}
        >
          🍽️ {restaurante.plato_recomendado}
        </p>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      
      {/* Sección Sorpréndeme */}
      <div 
        className="rounded-3xl shadow-sm p-8 text-center transition-colors duration-300 border"
        style={cardStyle}
      >
        <div className="text-4xl mb-3">🎲</div>
        <h2 
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: 'Merriweather, serif', color: 'var(--card-title)' }}
        >
          ¿No sabes qué elegir?
        </h2>
        <p 
          className="text-sm mb-5"
          style={{ color: 'var(--card-subtitle)' }}
        >
          Deja que el destino elija por ti
        </p>
        <button
          onClick={sorprenderme}
          className="px-8 py-3 text-white rounded-2xl font-semibold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg hover:shadow-xl"
          style={{ 
            backgroundColor: '#D97706',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
          }}
        >
          🎰 ¡Sorpréndeme!
        </button>
      </div>

      {/* Categorías por mejor_para */}
      {categoriasConRestaurantes.map(categoria => {
        const restaurantesCategoria = getRestaurantesPorCategoria(categoria.id)
        
        return (
          <div 
            key={categoria.id}
            className="rounded-3xl shadow-sm p-6 transition-colors duration-300 border"
            style={cardStyle}
          >
            <h3 
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--card-title)' }}
            >
              <span>{categoria.emoji}</span>
              <span style={{ fontFamily: 'Merriweather, serif' }}>{categoria.nombre}</span>
              <span 
                className="text-xs font-normal px-2 py-0.5 rounded-full ml-2"
                style={{ 
                  backgroundColor: 'var(--badge-bg)',
                  color: 'var(--card-subtitle)'
                }}
              >
                {restaurantesCategoria.length}
              </span>
            </h3>
            
            {/* Scroll horizontal */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
              {restaurantesCategoria.map(restaurante => (
                <MiniCard
                  key={restaurante.id}
                  restaurante={restaurante}
                  onClick={() => setSelectedRestaurante(restaurante)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Favoritos absolutos */}
      {favoritos.length > 0 && (
        <div 
          className="rounded-3xl shadow-sm p-6 transition-colors duration-300 border"
          style={{ 
            ...cardStyle,
            background: 'linear-gradient(135deg, var(--card-bg) 0%, color-mix(in srgb, var(--card-bg) 95%, #D97706) 100%)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--card-title)' }}
          >
            <span className="text-[#D97706]">⭐</span>
            <span style={{ fontFamily: 'Merriweather, serif' }}>Mis favoritos absolutos</span>
          </h3>
          
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
            {favoritos.map(restaurante => (
              <MiniCard
                key={restaurante.id}
                restaurante={restaurante}
                onClick={() => setSelectedRestaurante(restaurante)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top 5 por puntuación */}
      <div 
        className="rounded-3xl shadow-sm p-6 transition-colors duration-300 border"
        style={cardStyle}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--card-title)' }}
        >
          <span>🏆</span>
          <span style={{ fontFamily: 'Merriweather, serif' }}>Top 5 mejor valorados</span>
        </h3>
        
        <div className="space-y-3">
          {restaurantes
            .filter(r => r.puntuacion)
            .sort((a, b) => b.puntuacion - a.puntuacion)
            .slice(0, 5)
            .map((restaurante, index) => (
              <div 
                key={restaurante.id}
                onClick={() => setSelectedRestaurante(restaurante)}
                className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] border"
                style={itemStyle}
              >
                {/* Número del Ranking */}
                <span 
                  className="text-3xl font-bold w-10 text-center"
                  style={{ 
                    color: index === 0 ? '#D97706' : 
                           index === 1 ? '#9CA3AF' : 
                           index === 2 ? '#B45309' : 'var(--card-meta)',
                    opacity: index < 3 ? 1 : 0.5
                  }}
                >
                  {index + 1}
                </span>
                
                {/* Info Restaurante */}
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-semibold truncate" 
                    style={{ color: 'var(--card-title)' }}
                  >
                    {restaurante.nombre}
                  </h4>
                  <p 
                    className="text-sm truncate" 
                    style={{ color: 'var(--card-subtitle)' }}
                  >
                    {restaurante.tipo_comida} · {restaurante.barrio}
                  </p>
                </div>

                {/* Badge de Puntuación */}
                <div 
                  className="px-3 py-1.5 rounded-xl text-sm font-bold border"
                  style={{ 
                    backgroundColor: 'var(--badge-bg)',
                    color: 'var(--card-title)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  {restaurante.puntuacion?.toFixed(1)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal para restaurante seleccionado */}
      <RestaurantModal 
        restaurante={selectedRestaurante} 
        onClose={() => setSelectedRestaurante(null)} 
      />

      {/* Modal especial para Sorpréndeme */}
      {showSorpresa && restauranteSorpresa && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSorpresa(false)}
        >
          <div 
            className="rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header festivo */}
            <div 
              className="p-6 text-center"
              style={{ background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' }}
            >
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-white">¡Tu destino gastronómico!</h3>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <h4 
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Merriweather, serif', color: 'var(--card-title)' }}
              >
                {restauranteSorpresa.nombre}
              </h4>
              <p style={{ color: 'var(--card-subtitle)' }}>
                {restauranteSorpresa.tipo_comida} 
                {restauranteSorpresa.subtipo_comida && ` · ${restauranteSorpresa.subtipo_comida}`}
              </p>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm" style={{ color: 'var(--card-subtitle)' }}>
                  📍 {restauranteSorpresa.barrio}
                </p>
                <p className="text-sm" style={{ color: 'var(--card-subtitle)' }}>
                  💰 {restauranteSorpresa.precio_categoria} 
                  {restauranteSorpresa.precio_min && restauranteSorpresa.precio_max && 
                    ` (${restauranteSorpresa.precio_min}-${restauranteSorpresa.precio_max}€)`
                  }
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--card-title)' }}>
                  ⭐ {restauranteSorpresa.puntuacion?.toFixed(1)} / 5
                </p>
              </div>

              {restauranteSorpresa.descripcion_personal && (
                <div 
                  className="mt-4 p-3 rounded-xl max-h-32 overflow-y-auto"
                  style={{ backgroundColor: 'var(--badge-bg)' }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--card-title)' }}>
                    {restauranteSorpresa.descripcion_personal}
                  </p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSorpresa(false)
                    setSelectedRestaurante(restauranteSorpresa)
                  }}
                  className="flex-1 py-3 rounded-2xl font-medium text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#D97706' }}
                >
                  Ver más detalles
                </button>
                <button
                  onClick={() => {
                    sorprenderme()
                  }}
                  className="flex-1 py-3 rounded-2xl font-medium transition-all hover:opacity-80 active:scale-95 border"
                  style={{ 
                    backgroundColor: 'var(--filter-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--card-title)'
                  }}
                >
                  🎲 Otro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS para animación */}
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: var(--badge-bg);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--card-border);
          border-radius: 3px;
        }
      `}</style>
    </div>
  )
}

export default Destacados