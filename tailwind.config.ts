import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Le Monde editorial palette
        canvas: '#F5F4F0',        // warm newsprint off-white
        surface: '#FFFFFF',       // pure white
        panel: '#EFEEE9',         // light warm gray
        card: '#F8F7F3',          // near-white cards
        border: '#D5D4CE',        // light warm dividers
        muted: '#AEADA7',         // muted borders
        accent: {
          DEFAULT: '#003189',     // Le Monde signature navy
          hover: '#0044C9',
          dim: '#001F5C',
          glow: 'rgba(0,49,137,0.08)',
        },
        rouge: {
          DEFAULT: '#B72025',     // Le Monde red
          hover: '#E53035',
          dim: '#7A1518',
        },
        // Semantic
        foreground: '#1A1918',
        'foreground-muted': '#57564F',
        'foreground-dim': '#98968F',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        lg: '0.25rem',
        md: '0.125rem',
        sm: '0',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [animate],
}

export default config
