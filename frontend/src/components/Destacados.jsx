function Destacados({ restaurantes }) {
  const top5 = restaurantes
    .filter(r => r.puntuacion)
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="rounded-3xl shadow-sm p-8" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--card-title)' }}>⭐ Mis Top 5</h2>

        <div className="space-y-4">
          {top5.map((restaurante, index) => (
            <div
              key={restaurante.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ backgroundColor: 'var(--input-bg)' }}
            >
              <span className="text-3xl font-bold w-10" style={{ color: 'var(--card-meta)' }}>
                {index + 1}
              </span>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: 'var(--card-title)' }}>{restaurante.nombre}</h3>
                <p className="text-sm" style={{ color: 'var(--card-subtitle)' }}>
                  {restaurante.tipo_comida} · {restaurante.barrio}
                </p>
              </div>
              <div className="bg-gray-900 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
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