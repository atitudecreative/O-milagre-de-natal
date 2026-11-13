import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: '#0B0B0B',
        papel: '#F1EBDD',
        menta: '#D3ECE6',
        pessego: '#F8DCC8',
        creme: '#F5E3B5',
        cortina: '#D2381F',
        pinheiro: '#0E5A3A',
        turquesa: '#1FA3A0',
        ouro: '#E8B23A',
        picadeiro: '#F26A1B',
        palco: '#140C0A',
        // tokens antigos (painel administrativo)
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
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '28px', big: '40px' },
      maxWidth: { site: '1440px' },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.23, 1, 0.32, 1)',
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
