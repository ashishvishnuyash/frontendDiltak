import type { Config } from 'tailwindcss';
import { brand, primary, bg, neutral, text, status, spacing, typography } from './lib/tokens';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs:  '320px',
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },
    extend: {
      // ── Font family ──────────────────────────────────────────────────────
      fontFamily: typography.fontFamily as any,

      // ── Font sizes (maps to token scale) ─────────────────────────────────
      fontSize: typography.fontSize as any,

      // ── Spacing (token scale merged on top of Tailwind defaults) ─────────
      spacing: spacing as any,

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        card: '16px',
        'card-lg': '24px',
      },

      // ── Colors ────────────────────────────────────────────────────────────
      colors: {
        // Shadcn/Radix semantic tokens (CSS-var driven — keep for component compat)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          // Full primary scale
          0:   primary[0],
          50:  primary[50],
          100: primary[100],
          200: primary[200],
          300: primary[300],
          400: primary[400],
          500: primary[500],
          600: primary[600],
          700: primary[700],
          800: primary[800],
          900: primary[900],
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },

        // ── Design token colors ──────────────────────────────────────────
        brand: {
          100: brand[100],
          200: brand[200],
          300: brand[300],
          400: brand[400],
          500: brand[500],
          600: brand[600],
          700: brand[700],
          DEFAULT: brand[500],
        },

        bg: {
          0:   bg[0],
          50:  bg[50],
          100: bg[100],
          200: bg[200],
          300: bg[300],
        },

        neutral: {
          0:   neutral[0],
          50:  neutral[50],
          100: neutral[100],
          200: neutral[200],
          300: neutral[300],
        },

        txt: {
          headings:  text.headings,
          primary:   text.primary,
          secondary: text.secondary,
          disabled:  text.disabled,
          dividers:  text.dividers,
          loader:    text.loader,
          inverse:   text.inverse,
          tertiary:  text.tertiary,
          selected:  text.selected,
        },

        success: {
          subtle:  status.success.subtle,
          DEFAULT: status.success.default,
          bold:    status.success.bold,
        },
        warning: {
          subtle:  status.warning.subtle,
          DEFAULT: status.warning.default,
          bold:    status.warning.bold,
        },
        error: {
          subtle:  status.error.subtle,
          DEFAULT: status.error.default,
          bold:    status.error.bold,
        },
      },

      // ── Keyframes ─────────────────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'spin-slow':      'spin-slow 8s linear infinite',
      },

      // ── Background images ─────────────────────────────────────────────────
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
