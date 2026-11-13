import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#08070A',
        ink: '#100D11',
        umber: '#1B1411',
        midnight: '#0A1C27',
        abyss: '#06121A',
        copper: '#C68752',
        gold: '#E6BC88',
        champagne: '#F3E2C6',
        cream: '#EFE7DA',
        mist: '#A9A19A',
        starlight: '#9CB6C4',
        ember: '#B4472C',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { label: '0.24em' },
      maxWidth: { site: '1360px' },
      transitionTimingFunction: { silk: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
} satisfies Config;
