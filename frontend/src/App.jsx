import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Explorar from './components/Explorar'
import Mapa from './components/Mapa'
import Chat from './components/Chat'
import Destacados from './components/Destacados'
import DarkModeToggle from './components/DarkModeToggle'

function App() {
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
    { id: 'explorar', nombre: 'Explorar', path: '/' },
    { id: 'mapa', nombre: 'Mapa', path: '/mapa' },
    { id: 'chat', nombre: 'Pregúntame', path: '/chat' },
    { id: 'destacados', nombre: 'Top Picks', path: '/top-picks' },
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
              <NavLink
                key={pestana.id}
                to={pestana.path}
                end={pestana.path === '/'}
                className="px-5 py-3 text-sm font-medium rounded-t-xl transition-all text-center"
                style={({ isActive }) => ({
                  backgroundColor: 'transparent',
                  boxShadow: isActive ? 'inset 0 -2px 0 0 var(--card-title)' : 'none',
                  color: isActive ? 'var(--card-title)' : 'var(--card-subtitle)',
                  opacity: isActive ? 1 : 0.7
                })}
              >
                {pestana.nombre}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido - Rutas */}
      <main>
        <Routes>
          <Route path="/" element={<Explorar restaurantes={restaurantes} loading={loading} />} />
          <Route path="/mapa" element={<Mapa restaurantes={restaurantes} />} />
          <Route path="/chat" element={<Chat restaurantes={restaurantes} />} />
          <Route path="/top-picks" element={<Destacados restaurantes={restaurantes} />} />
          {/* Redirigir rutas desconocidas a Explorar */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App