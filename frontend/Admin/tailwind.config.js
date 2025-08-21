/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        oxford: {
          900: '#000A17', // Updated Oxford Blue
          800: '#0a2e5c',
          700: '#13396d',
        },
        navy: {
          900: '#0a1833',
          800: '#11224d',
          700: '#1a2d5a',
          600: '#22386b',
        },
        'blue-glass': 'hsla(220,80%,30%,0.7)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      keyframes: {
        'sidebar-glass': {
          '0%': { opacity: 0, transform: 'translateX(-30px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        'sidebar-glass': 'sidebar-glass 0.7s cubic-bezier(0.4,0,0.2,1) both',
      },
    },
  },
  plugins: [],
};
