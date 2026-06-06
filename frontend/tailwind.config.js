/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ff6b35',
          dark: '#e55a2b',
          light: '#ff8f66',
        },
        surface: {
          DEFAULT: '#1a1a2e',
          card: '#16213e',
          muted: '#0f3460',
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
