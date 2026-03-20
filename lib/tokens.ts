/**
 * Design Tokens — Single source of truth
 * All colors, typography, spacing, and semantic aliases live here.
 * Consumed by tailwind.config.ts and globals.css.
 */

// ─── Brand (teal-green scale) ────────────────────────────────────────────────
export const brand = {
  100: '#E8F9F3',
  200: '#BFF1DD',
  300: '#7EE3BE',
  400: '#3CCF9C',
  500: '#1FA97A', // default brand / primary action
  600: '#148A63',
  700: '#0F6B4F',
} as const;

// ─── Primary (blue scale) ────────────────────────────────────────────────────
export const primary = {
  0:   '#FFFFFF',
  50:  '#E9F6FF',
  100: '#CFEFFF',
  200: '#A5DDFF',
  300: '#7CCBFF',
  400: '#4FB8FF',
  500: '#2BADFF',
  600: '#1976D2',
  700: '#1565C0',
  800: '#0E4874',
  900: '#072C4A',
} as const;

// ─── Background ──────────────────────────────────────────────────────────────
export const bg = {
  0:   '#FFFFFF',
  50:  '#F7FBF9',
  100: '#EEF6F2',
  200: '#DCEEE6',
  300: '#C8E3D7',
} as const;

// ─── Neutral / UI backgrounds (from user spec) ───────────────────────────────
export const neutral = {
  0:   '#FFFFFF',
  50:  '#FAFAFA',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
} as const;

// ─── Text ────────────────────────────────────────────────────────────────────
export const text = {
  headings:  '#0F172A',
  primary:   '#1E293B',
  secondary: '#334155',
  disabled:  '#94A3B8',
  dividers:  '#E2E8F0',
  loader:    '#EEEEEE',
  inverse:   '#FFFFFF',
  // legacy aliases kept for backward compat
  tertiary:  '#6B7280',
  selected:  '#0D51FF',
} as const;

// ─── Semantic — Status ───────────────────────────────────────────────────────
export const status = {
  success: {
    subtle: '#E8F7EE',
    default: '#22C55E',
    bold:    '#16A34A',
  },
  warning: {
    subtle: '#FFF7E5',
    default: '#F59E0B',
    bold:    '#D97706',
  },
  error: {
    subtle: '#FDECEC',
    default: '#F44444',
    bold:    '#DC2626',
  },
} as const;

// ─── Spacing scale (px values, used in Tailwind spacing extension) ───────────
export const spacing = {
  0:  '0px',
  4:  '4px',
  8:  '8px',
  12: '12px',
  16: '16px',
  18: '18px',
  20: '20px',
  24: '24px',
  32: '32px',
  48: '48px',
  80: '80px',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    // Headings
    h1: ['32px', { lineHeight: '40px', fontWeight: '600' }],
    h2: ['28px', { lineHeight: '36px', fontWeight: '600' }],
    h3: ['24px', { lineHeight: '32px', fontWeight: '600' }],
    h4: ['20px', { lineHeight: '28px', fontWeight: '600' }],
    h5: ['18px', { lineHeight: '26px', fontWeight: '600' }],
    // Body — Large
    'l-semibold': ['18px', { lineHeight: '26px', fontWeight: '600' }],
    'l-regular':  ['18px', { lineHeight: '26px', fontWeight: '400' }],
    // Body — Medium
    'm-semibold': ['16px', { lineHeight: '24px', fontWeight: '600' }],
    'm-regular':  ['16px', { lineHeight: '24px', fontWeight: '400' }],
    // Body — Small
    's-regular':  ['14px', { lineHeight: '20px', fontWeight: '400' }],
    's-semibold': ['14px', { lineHeight: '20px', fontWeight: '600' }],
    // UI
    'label':            ['14px', { lineHeight: '20px', fontWeight: '500' }],
    'caption':          ['12px', { lineHeight: '18px', fontWeight: '400' }],
    'caption-semibold': ['12px', { lineHeight: '18px', fontWeight: '600' }],
    'micro':            ['10px', { lineHeight: '14px', fontWeight: '400' }],
  },
} as const;
