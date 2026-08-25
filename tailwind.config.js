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
          bg: '#0a0d14',
          card: '#121722',
          border: '#1e2638',
          hover: '#1b2234',
        },
        poly: {
          green: '#00d26a',
          red: '#ff3b69',
          blue: '#2d68ff',
          yellow: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
