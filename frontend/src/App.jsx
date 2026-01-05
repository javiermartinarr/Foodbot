import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Explorar from './components/Explorar'
import Mapa from './components/Mapa'
import Chat from './components/Chat'
import Destacados from './components/Destacados'
import DarkModeToggle from './components/DarkModeToggle'

function App() {
  const [pestanaActiva, setPestanaActiva] = useState('explorar')
  const [restaurantes, setRestaurantes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurantes()
  }, [])

  async function fetchRestaurantes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurantes')
      .select('*')
      .eq('activo', true)
      .order('puntuacion', { ascending: false })

    if (error) {
      console.error('Error cargando restaurantes:', error)
    } else {
      setRestaurantes(data)
    }
    setLoading(false)
  }

  const pestanas = [
    { id: 'explorar', nombre: 'Explorar', icono: '🍽️' },
    { id: 'mapa', nombre: 'Mapa', icono: '🗺️' },
    { id: 'chat', nombre: 'Pregúntame', icono: '💬' },
    { id: 'destacados', nombre: 'Top Picks', icono: '⭐' },
  ]

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{
        background: 'var(--bg-gradient, linear-gradient(to bottom, #fef3e7, #fde8d4, #fce4c4))'
      }}
    >
      {/* Header con navegación */}
      <header 
        className="backdrop-blur-lg sticky top-0 z-40"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--filter-bg) 80%, transparent)',
          borderBottom: '1px solid var(--filter-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Título y estado */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <DarkModeToggle />
            </div>
            <div className="flex items-center gap-2">
              <h1 
                className="text-3xl font-semibold tracking-tight" 
                style={{ fontFamily: 'Merriweather, serif', color: 'var(--card-title)' }}
              >
                Foodbot
              </h1>
              <p className="text-sm self-center" style={{ color: 'var(--card-subtitle)' }}>
                by Alba and Javi
              </p>
            </div>
            <div className="flex-1 flex items-center justify-end">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--card-meta)' }}>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {restaurantes.length} restaurantes
              </div>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <nav className="flex gap-1 -mb-px justify-center">
            {pestanas.map(pestana => (
              <button
                key={pestana.id}
                onClick={() => setPestanaActiva(pestana.id)}
                className="px-5 py-3 text-sm font-medium rounded-t-xl transition-all text-center"
                style={{
                  backgroundColor: pestanaActiva === pestana.id ? 'var(--input-bg)' : 'transparent',
                  color: pestanaActiva === pestana.id ? 'var(--card-title)' : 'var(--card-subtitle)'
                }}
              >
                {pestana.nombre}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido de la pestaña activa */}
      <main>
        {pestanaActiva === 'explorar' && (
          <Explorar restaurantes={restaurantes} loading={loading} />
        )}
        {pestanaActiva === 'mapa' && (
          <Mapa restaurantes={restaurantes} />
        )}
        {pestanaActiva === 'chat' && (
          <Chat restaurantes={restaurantes} />
        )}
        {pestanaActiva === 'destacados' && (
          <Destacados restaurantes={restaurantes} />
        )}
      </main>
    </div>
  )
}

export default App