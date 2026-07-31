import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#1C1C28',
          light: '#2A2A3C',
          card: '#252538',
          elevated: '#35354A',
        },
        rose: {
          50: '#FFF0F5',
          100: '#FFE0EB',
          200: '#FFB8D0',
          300: '#FF8FAB',
          400: '#FF6B9D',
          500: '#E84393',
          600: '#C44569',
          700: '#9B2D5A',
          800: '#6B1D3F',
        },
        text: {
          primary: '#F5F0EB',
          secondary: '#A89FA8',
          muted: '#6B6370',
        },
        border: {
          subtle: '#3A3A4C',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0, 0, 0, 0.2)',
        'soft-lg': '0 8px 40px rgba(0, 0, 0, 0.3)',
        'soft-xl': '0 12px 48px rgba(0, 0, 0, 0.35)',
        glow: '0 0 20px rgba(255, 107, 157, 0.15)',
        'glow-lg': '0 0 40px rgba(255, 107, 157, 0.2)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
