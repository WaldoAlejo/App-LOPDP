/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ef',
          100: '#b0e6c8',
          200: '#8ad9ac',
          300: '#54c885',
          400: '#33bd6d',
          500: '#00a651',
          600: '#00974a',
          700: '#00763a',
          800: '#005b2d',
          900: '#004622',
        },
        servi: {
          green: '#00A651',
          'green-dark': '#009A44',
          'green-light': '#00C65E',
          gray: '#97999B',
          'gray-light': '#F5F5F5',
          'gray-dark': '#6B6D6F',
          magenta: '#DF1995',
          white: '#FFFFFF',
          black: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
