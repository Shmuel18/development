/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ מאפשר מצב לילה לפי class="dark"
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Assistant', 'sans-serif'], // 👈 הוספת פונט
      },
    },
  },
  plugins: [],
}
