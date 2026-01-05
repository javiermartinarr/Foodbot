import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const html = document.documentElement
    
    if (darkMode) {
      html.classList.add('dark')
      html.style.setProperty('--bg-gradient', '#1a1a1a')
    } else {
      html.classList.remove('dark')
      html.style.setProperty('--bg-gradient', 'linear-gradient(to bottom, #fef3e7, #fde8d4, #fce4c4)')
    }
    
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative w-14 h-7 bg-gray-200 dark:bg-dark-border rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-brand/50"
      aria-label="Toggle dark mode"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          darkMode 
            ? 'translate-x-7 bg-dark-card' 
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