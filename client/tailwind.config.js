/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f7',
          100: '#fce7f0',
          200: '#fbcfe1',
          300: '#f8a8c8',
          400: '#f272a3',
          500: '#e84381',
          600: '#d02465',
          700: '#ad1751',
          800: '#8f1645',
          900: '#78163d',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
