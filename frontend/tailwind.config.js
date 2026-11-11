/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Fashion-atelier palette: a saturated scarlet house colour, warm gold,
        // electric cobalt and magenta accents, plus warm/cool neutrals.
        ink: {
          DEFAULT: '#0d0d0f',
          50: '#f6f6f7',
          100: '#e7e7ea',
          200: '#c9c9d0',
          300: '#a3a3ae',
          400: '#71717e',
          500: '#4a4a55',
          600: '#33333c',
          700: '#232329',
          800: '#16161a',
          900: '#0d0d0f',
          950: '#08080a',
        },
        porcelain: {
          DEFAULT: '#f7f4ef',
          50: '#fdfcfa',
          100: '#f7f4ef',
          200: '#efe9df',
          300: '#e2d9ca',
        },
        brand: {
          DEFAULT: '#e8363c',
          50: '#fff1f1',
          100: '#ffe0e1',
          200: '#ffc7c9',
          300: '#ff9ea2',
          400: '#fb6b71',
          500: '#e8363c',
          600: '#d21f26',
          700: '#b0161d',
          800: '#92161c',
          900: '#7a171d',
        },
        gold: {
          DEFAULT: '#f2b75a',
          400: '#f6c877',
          500: '#f2b75a',
          600: '#d99a35',
        },
        cobalt: {
          DEFAULT: '#2f5bff',
          500: '#2f5bff',
          600: '#1f47e0',
        },
        magenta: {
          DEFAULT: '#d6249f',
          500: '#d6249f',
          600: '#b3187f',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,13,15,0.04), 0 8px 30px -12px rgba(13,13,15,0.18)',
        lift: '0 18px 50px -20px rgba(13,13,15,0.35)',
        glow: '0 0 0 1px rgba(232,54,60,0.25), 0 12px 40px -12px rgba(232,54,60,0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #e8363c 0%, #d6249f 55%, #2f5bff 120%)',
        'gold-gradient': 'linear-gradient(120deg, #f6c877 0%, #f2b75a 50%, #d99a35 100%)',
        'ink-gradient': 'linear-gradient(160deg, #16161a 0%, #0d0d0f 60%, #08080a 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(24px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}