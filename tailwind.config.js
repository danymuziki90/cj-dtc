module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cjblue: {
          50: '#eef5ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          300: '#8db3ff',
          400: '#5f90ff',
          500: '#356dff',
          600: '#1f4fdd',
          700: '#133cba',
          800: '#102f8f',
          900: '#0f2b74',
          DEFAULT: '#002D72'
        },
        cjred: {
          50: '#fff1f2',
          100: '#ffe0e2',
          200: '#ffc5c9',
          300: '#ff9aa1',
          400: '#ff5f6b',
          500: '#f53142',
          600: '#e30613',
          700: '#b3040f',
          800: '#950810',
          900: '#7d0d14',
          DEFAULT: '#E30613'
        }
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
