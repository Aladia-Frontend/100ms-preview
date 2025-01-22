/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      fontWeight: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
      },
      fontSize: {
        8: '0.5rem', // text-8
        9: '0.5625rem', // text-9
        10: '0.625rem', // text-10
        11: '0.6875rem', // text-11
        13: '0.8125rem', // text-13
      },
      borderRadius: {
        5: '5px',
      },
    },
  },
  plugins: [],
}

