function Destacados({ restaurantes }) {
    const top5 = restaurantes
      .filter(r => r.puntuacion)
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 5)
  
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">⭐ Mis Top 5</h2>
          
          <div className="space-y-4">
            {top5.map((restaurante, index) => (
              <div 
                key={restaurante.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl"
              >
                <span className="text-3xl font-bold text-gray-300 w-10">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{restaurante.nombre}</h3>
                  <p className="text-sm text-gray-500">
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