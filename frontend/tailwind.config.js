/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        // Personaliza los breakpoints si es necesario
        'sm': '640px',   // Small devices (phones)
        'md': '768px',   // Medium devices (tablets)
        'lg': '1024px',  // Large devices (desktops)
        'xl': '1280px',  // Extra-large devices
        '2xl': '1536px', // 2x large devices
      },
    },
  },
  plugins: [],
};