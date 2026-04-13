/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spots: {
          bg: '#0f0f1a',
          surface: '#1a1a2e',
          card: '#232340',
          accent: '#e94560',
          'accent-light': '#ff6b81',
          text: '#eaeaea',
          muted: '#8888a0',
          border: '#2a2a45',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
