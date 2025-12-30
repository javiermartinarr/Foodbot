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
      className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300"
      style={{
        background: 'var(--bg-gradient, linear-gradient(to bottom, #fef3e7, #fde8d4, #fce4c4))'
      }}
    >
      {/* Header con navegación */}
      <header className="bg-white/80 dark:bg-dark-card/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Título y estado */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <DarkModeToggle />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold text-[#1F2937] dark:text-dark-text tracking-tight" style={{ fontFamily: 'Merriweather, serif' }}>
                Foodbot
              </h1>
              <p className="text-sm text-gray-500 dark:text-dark-muted self-center">
                by Alba and Javi
              </p>
            </div>
            <div className="flex-1 flex items-center justify-end">
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-dark-muted">
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
                className={`
                  px-5 py-3 text-sm font-medium rounded-t-xl transition-all text-center
                  ${pestanaActiva === pestana.id
                    ? 'bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-dark-text'
                    : 'text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border'
                  }
                `}
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