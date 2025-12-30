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
          // Anthropic Style: Tonos cálidos/tierra muy oscuros
          bg: '#191918',       // Fondo principal (Casi negro, pero con un toque marrón/cálido)
          card: '#242423',     // Fondo de tarjetas/inputs (Ligeramente más claro)
          border: '#3A3A38',   // Bordes sutiles cálidos
          text: '#F3F2EF',     // Texto principal (No es blanco puro #FFF, es crema/marfil)
          muted: '#A1A19D',    // Texto secundario cálido
          hover: '#2E2E2D',    // Estados hover
          accent: '#D97706',   // Tu color ámbar actual encaja perfecto aquí
        }
      }
    },
  },
  plugins: [],
}