function Mapa({ restaurantes }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="rounded-3xl shadow-sm p-12 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--card-title)' }}>Mapa interactivo</h2>
        <p className="mb-4" style={{ color: 'var(--card-subtitle)' }}>
          Próximamente: explora los {restaurantes.length} restaurantes en el mapa
        </p>
        <span className="inline-block bg-amber-100 text-amber-700 text-sm px-4 py-2 rounded-full font-medium">
          🚧 En desarrollo
        </span>
      </div>
    </div>
  )
}

export default Mapa