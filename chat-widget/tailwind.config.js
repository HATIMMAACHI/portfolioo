/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chatBg: {
          light: '#ffffff',
          dark: '#121212',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
