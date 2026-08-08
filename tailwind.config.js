module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cjblue: {
          50: '#e8f0fb',
          100: '#c5d7f5',
          200: '#9dbdee',
          300: '#72a1e6',
          400: '#4a88df',
          500: '#2270d8',
          600: '#1565D8',
          700: '#1050b0',
          800: '#0c3d88',
          900: '#082e67',
          DEFAULT: '#0A4FB3'
        },
        cjred: {
          50: '#fde8e8',
          100: '#f9c7c7',
          200: '#f4a2a2',
          300: '#ee7b7b',
          400: '#e95e5e',
          500: '#e53935',
          600: '#d32f2f',
          700: '#C62828',
          800: '#b71c1c',
          900: '#7f0000',
          DEFAULT: '#E53935'
        }
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
        segoe: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
