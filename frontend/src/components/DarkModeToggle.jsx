import { useState, useEffect } from 'react'

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return JSON.parse(saved)
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      // Anthropic-inspired dark background
      document.documentElement.style.setProperty('--bg-gradient', '#1a1a1a')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.setProperty('--bg-gradient', 'linear-gradient(to bottom, #fef3e7, #fde8d4, #fce4c4)')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative w-14 h-7 bg-gray-200 dark:bg-dark-border rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D97706]/50"
      aria-label="Toggle dark mode"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white dark:bg-dark-card rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          darkMode ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {darkMode ? (
          <span className="text-sm">🌙</span>
        ) : (
          <span className="text-sm">☀️</span>
        )}
      </span>
    </button>
  )
}

export default DarkModeToggle