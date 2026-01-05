import { useState, useEffect, useLayoutEffect } from 'react'

// Función helper para aplicar el modo (usada tanto en init como en cambios)
function applyDarkMode(isDark) {
  const html = document.documentElement
  
  if (isDark) {
    html.classList.add('dark')
    html.style.setProperty('--bg-gradient', '#1a1a1a')
  } else {
    html.classList.remove('dark')
    html.style.setProperty('--bg-gradient', 'linear-gradient(to bottom, #fef3e7, #fde8d4, #fce4c4)')
  }
}

// Aplicar inmediatamente antes del render para evitar flash
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('darkMode')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved !== null ? JSON.parse(saved) : prefersDark
  applyDarkMode(isDark)
}

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // useLayoutEffect para aplicar ANTES del paint del navegador
  useLayoutEffect(() => {
    applyDarkMode(darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative w-14 h-7 bg-amber-100 dark:bg-dark-elevated rounded-full transition-colors duration-300 focus:outline-none border-2 border-[#D97706]"
      aria-label="Toggle dark mode"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          darkMode 
            ? 'translate-x-7 bg-dark-bg' 
            : 'translate-x-0 bg-white'
        }`}
      >
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