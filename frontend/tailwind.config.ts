import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8eb',
          100: '#ffefcc',
          200: '#ffe09a',
          300: '#ffd068',
          400: '#f4b53b',
          500: '#db9523',
          600: '#b97718',
          700: '#87520f',
          800: '#5b360a',
          900: '#2e1d05'
        }
      },
      boxShadow: {
        panel: '0 12px 30px -18px rgba(15, 23, 42, 0.4)',
      },
      borderRadius: {
        panel: '1.1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
