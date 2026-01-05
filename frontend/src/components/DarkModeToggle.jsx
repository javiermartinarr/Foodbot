import { useState, useLayoutEffect } from 'react'

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    
    try {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Error reading darkMode:', e)
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useLayoutEffect(() => {
    const html = document.documentElement
    
    if (darkMode) {
      html.classList.add('dark')
      html.style.setProperty('--bg-gradient', '#1a1a1a')
    } else {
      html.classList.remove('dark')
      html.style.setProperty('--bg-gradient', 'linear-gradient(to bottom, #fef3e7, #fde8d4, #fce4c4)')
    }
    
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode))
    } catch (e) {
      console.warn('Error saving darkMode:', e)
    }
  }, [darkMode])

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative flex items-center w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none border-2 border-[#D97706]"
      style={{
        backgroundColor: darkMode ? '#404040' : '#FDE68A'
      }}
      aria-label="Toggle dark mode"
      title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {/* Círculo deslizante */}
      <span
        className="absolute w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-sm"
        style={{
          backgroundColor: darkMode ? '#1a1a1a' : '#FFFFFF',
          left: darkMode ? 'calc(100% - 28px)' : '2px'
        }}
      >
        {darkMode ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default DarkModeToggle