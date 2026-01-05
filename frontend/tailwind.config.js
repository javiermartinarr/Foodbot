/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          // Anthropic-inspired palette (based on Claude interface)
          // Background colors
          bg: '#1a1a1a',       // Main background - almost black
          card: '#2d2d2d',     // Card/surface background - slightly lighter
          border: '#404040',   // Subtle borders
          hover: '#3a3a3a',    // Hover states
          
          // Text colors
          text: '#e5e5e5',     // Primary text - off-white
          muted: '#999999',     // Secondary/muted text
          
          // Accent
          accent: '#D97706',   // Your amber brand color
        }
      }
    },
  },
  plugins: [],
}