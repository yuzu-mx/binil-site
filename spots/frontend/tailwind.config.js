/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spots: {
          // Tryp brand palette
          dark: '#113A36',        // Dark green - primary text, headers
          mint: '#46DDAE',        // Mint green - accent, CTAs, highlights
          yellow: '#FFD34A',      // Yellow/Gold - secondary accent, badges
          cream: '#FFFAE8',       // Cream - main background
          // Derived shades
          'dark-light': '#1a4f4a', // Lighter dark green
          'mint-light': '#6be8c4', // Lighter mint
          'mint-dark': '#35b88e',  // Darker mint for hover
          surface: '#FFF5D6',     // Slightly darker cream for cards
          border: '#E8DFC0',      // Warm border
          muted: '#7A7460',       // Muted text on cream
          'muted-light': '#A39E8C', // Lighter muted
          // Map overlay (dark elements on map)
          'map-surface': '#1a1a2e',
          'map-card': '#232340',
          'map-text': '#eaeaea',
          'map-muted': '#8888a0',
          'map-border': '#2a2a45',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Polysans Bulky Wide"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
