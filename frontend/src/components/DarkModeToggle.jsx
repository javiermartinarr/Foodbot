import { useState, useEffect } from 'react'

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    // Verificamos si estamos en el navegador para evitar errores de SSR si usaras Next.js
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      // APLICAMOS EL COLOR DE FONDO EXACTO DE LA CONFIGURACIÓN (dark.bg)
      document.documentElement.style.setProperty('--bg-gradient', '#191918')
    } else {
      document.documentElement.classList.remove('dark')
      // Mantenemos tu gradiente cálido original
      document.documentElement.style.setProperty('--bg-gradient', 'linear-gradient(to bottom, #fef3e7, #fde8d4, #fce4c4)')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative w-14 h-7 bg-gray-200 dark:bg-dark-border rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-dark-accent/50"
      aria-label="Toggle dark mode"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white dark:bg-dark-muted/20 text-dark-bg dark:text-dark-text rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          darkMode ? 'translate-x-7 bg-dark-card' : 'translate-x-0'
        }`}
      >
        {/* He simplificado los iconos para que se vean más limpios */}
        {darkMode ? (
          <span className="text-xs">🌙</span>
        ) : (
          <span className="text-xs">☀️</span>
        )}
      </span>
    </button>
  )
}

export default DarkModeToggle