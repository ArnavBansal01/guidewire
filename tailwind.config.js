/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        // Pushes the xl breakpoint just out of reach of your 1280px Chrome window
        'xl': '1292px', 
      },
    },
  },
  plugins: [],
};
