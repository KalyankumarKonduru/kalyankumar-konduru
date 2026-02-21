/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#060606',
          light: '#0f0f0f',
          lighter: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#c8a87c',
          light: '#d4b88e',
          dark: '#b8956a',
          muted: 'rgba(200, 168, 124, 0.15)',
        },
      },
    },
  },
  plugins: [],
}
