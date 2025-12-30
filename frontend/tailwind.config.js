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
          // Anthropic-inspired dark mode palette
          bg: '#1a1a1a',           // Very dark background (almost black)
          card: '#2d2d2d',         // Card background (slightly lighter)
          border: '#404040',        // Subtle borders
          text: '#e5e5e5',         // Primary text (high contrast)
          muted: '#999999',         // Secondary/muted text
          hover: '#3a3a3a',        // Hover states
        }
      }
    },
  },
  plugins: [],
}