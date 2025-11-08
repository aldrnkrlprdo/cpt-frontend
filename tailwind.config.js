module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'nbs': {
          red: '#c8102e',
          darkred: '#a10a25',
          gray: '#f5f5f5',
          text: '#2d3748',
          accent: '#ffc107'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [],
}