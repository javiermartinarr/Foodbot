function Destacados({ restaurantes }) {
  const top5 = restaurantes
    .filter(r => r.puntuacion)
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, 5)

  // Definimos estilos basados en variables para consistencia total
  const cardStyle = {
    backgroundColor: 'var(--card-bg)',
    borderColor: 'var(--card-border)',
    borderWidth: '1px'
  }

  const itemStyle = {
    backgroundColor: 'var(--filter-bg)', // Usamos el fondo de filtros/inputs para los items
    borderColor: 'var(--card-divider)',
    borderWidth: '1px'
  }

  const rankStyle = {
    color: 'var(--card-meta)' // Color gris sutil/dorado en dark
  }

  const scoreBadgeStyle = {
    backgroundColor: 'var(--badge-bg)', // Fondo oscuro suave en dark
    color: 'var(--card-title)', // Texto claro en dark
    borderColor: 'var(--card-border)'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div 
        className="rounded-3xl shadow-sm p-8 transition-colors duration-300"
        style={cardStyle}
      >
        <h2 
          className="text-2xl font-semibold mb-6 flex items-center gap-2" 
          style={{ fontFamily: 'Merriweather, serif', color: 'var(--card-title)' }}
        >
          <span className="text-[#D97706]">⭐</span> Mis Top 5
        </h2>
        
        <div className="space-y-4">
          {top5.map((restaurante, index) => (
            <div 
              key={restaurante.id}
              className="flex items-center gap-5 p-4 rounded-2xl transition-transform hover:scale-[1.01] duration-200"
              style={itemStyle}
            >
              {/* Número del Ranking */}
              <span className="text-4xl font-bold w-12 text-center opacity-40" style={rankStyle}>
                {index + 1}
              </span>
              
              {/* Info Restaurante */}
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-semibold text-lg truncate" 
                  style={{ color: 'var(--card-title)' }}
                >
                  {restaurante.nombre}
                </h3>
                <p 
                  className="text-sm truncate" 
                  style={{ color: 'var(--card-subtitle)' }}
                >
                  {restaurante.tipo_comida} · {restaurante.barrio}
                </p>
              </div>

              {/* Badge de Puntuación */}
              <div 
                className="px-3 py-1.5 rounded-xl text-sm font-bold border shadow-sm"
                style={scoreBadgeStyle}
              >
                {restaurante.puntuacion?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Destacados