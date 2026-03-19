/**
 * Responsive Utilities
 * Centralized responsive design patterns and breakpoint helpers
 */

export const BREAKPOINTS = {
  xs: '320px',   // Extra small devices
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X Extra large devices
} as const;

/**
 * Responsive container classes
 */
export const containerClasses = {
  base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'max-w-3xl',
  normal: 'max-w-7xl',
  wide: 'max-w-screen-2xl',
  full: 'max-w-full'
};

/**
 * Responsive spacing classes
 */
export const spacingClasses = {
  section: 'py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24',
  sectionSmall: 'py-4 sm:py-6 md:py-8 lg:py-10',
  gap: 'gap-4 sm:gap-6 lg:gap-8',
  gapSmall: 'gap-2 sm:gap-3 md:gap-4',
  gapLarge: 'gap-6 sm:gap-8 lg:gap-12'
};

/**
 * Responsive text classes
 */
export const textClasses = {
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold',
  h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
  h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
  h4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
  h5: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
  body: 'text-sm sm:text-base lg:text-lg',
  bodySmall: 'text-xs sm:text-sm md:text-base',
  caption: 'text-xs sm:text-sm'
};

/**
 * Responsive grid classes
 */
export const gridClasses = {
  cols1: 'grid grid-cols-1',
  cols2: 'grid grid-cols-1 sm:grid-cols-2',
  cols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  cols6: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  autoFit: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr'
};

/**
 * Responsive card classes
 */
export const cardClasses = {
  base: 'rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8',
  compact: 'rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6',
  large: 'rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12'
};

/**
 * Responsive button classes
 */
export const buttonClasses = {
  base: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
  small: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm',
  large: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg'
};

/**
 * Responsive icon sizes
 */
export const iconSizes = {
  xs: 'h-3 w-3 sm:h-4 sm:w-4',
  sm: 'h-4 w-4 sm:h-5 sm:w-5',
  base: 'h-5 w-5 sm:h-6 sm:w-6',
  lg: 'h-6 w-6 sm:h-8 sm:w-8',
  xl: 'h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12'
};

/**
 * Responsive flex classes
 */
export const flexClasses = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-start',
  column: 'flex flex-col',
  columnReverse: 'flex flex-col-reverse lg:flex-row',
  responsive: 'flex flex-col lg:flex-row'
};

/**
 * Hide/show at breakpoints
 */
export const displayClasses = {
  hideOnMobile: 'hidden sm:block',
  hideOnTablet: 'hidden md:block',
  hideOnDesktop: 'hidden lg:block',
  showOnMobile: 'block sm:hidden',
  showOnTablet: 'block md:hidden',
  showOnDesktop: 'block lg:hidden'
};

/**
 * Responsive image container
 */
export const imageClasses = {
  avatar: 'w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12',
  icon: 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:w-20',
  hero: 'w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[32rem]',
  thumbnail: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24'
};

/**
 * Utility function to combine classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get responsive value based on screen size
 */
export function getResponsiveValue<T>(
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
  },
  defaultValue: T
): T {
  if (typeof window === 'undefined') return defaultValue;
  
  const width = window.innerWidth;
  
  if (width >= 1536 && values['2xl']) return values['2xl'];
  if (width >= 1280 && values.xl) return values.xl;
  if (width >= 1024 && values.lg) return values.lg;
  if (width >= 768 && values.md) return values.md;
  if (width >= 640 && values.sm) return values.sm;
  if (values.xs) return values.xs;
  
  return defaultValue;
}

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint() {
  if (typeof window === 'undefined') {
    return 'lg'; // Default for SSR
  }

  const width = window.innerWidth;
  
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'xs';
}
