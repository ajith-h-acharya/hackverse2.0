/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          navy: '#131921',
          squid: '#232f3e',
          yellow: '#febd69',
          orange: '#f0c14b',
          blue: '#007185',
          light: '#eaeded',
          white: '#ffffff',
          grey: '#565959',
        }
      },
      boxShadow: {
        'amazon': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'amazon-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
      backgroundImage: {
        'alien-grid': "radial-gradient(circle, rgba(255, 0, 255, 0.1) 1px, transparent 1px)",
      },
    },
  },
  safelist: [
    'bg-theme-hidden', 'bg-theme-cultural', 'bg-theme-adventure', 'bg-theme-eco', 'bg-theme-city', 'bg-theme-time', 'bg-theme-taste',
    'border-theme-hidden', 'border-theme-cultural', 'border-theme-adventure', 'border-theme-eco', 'border-theme-city', 'border-theme-time', 'border-theme-taste',
    'text-theme-hidden', 'text-theme-cultural', 'text-theme-adventure', 'text-theme-eco', 'text-theme-city', 'text-theme-time', 'text-theme-taste',
  ],
  plugins: [],
}
