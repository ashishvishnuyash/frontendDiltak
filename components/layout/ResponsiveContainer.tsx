/**
 * ResponsiveContainer - Reusable responsive container component
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: 'narrow' | 'normal' | 'wide' | 'full';
  className?: string;
  noPadding?: boolean;
}

export function ResponsiveContainer({
  children,
  size = 'normal',
  className,
  noPadding = false
}: ResponsiveContainerProps) {
  const sizeClasses = {
    narrow: 'max-w-3xl',
    normal: 'max-w-7xl',
    wide: 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={cn(
        'w-full mx-auto',
        !noPadding && 'px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'small' | 'normal' | 'large';
}

export function ResponsiveSection({
  children,
  className,
  spacing = 'normal'
}: ResponsiveSectionProps) {
  const spacingClasses = {
    small: 'py-4 sm:py-6 md:py-8 lg:py-10',
    normal: 'py-8 sm:py-12 md:py-16 lg:py-20',
    large: 'py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32'
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'small' | 'normal' | 'large';
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = 3,
  gap = 'normal',
  className
}: ResponsiveGridProps) {
  const colClasses = {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
  };

  const gapClasses = {
    small: 'gap-2 sm:gap-3 md:gap-4',
    normal: 'gap-4 sm:gap-6 lg:gap-8',
    large: 'gap-6 sm:gap-8 lg:gap-12'
  };

  return (
    <div className={cn(colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  size?: 'compact' | 'normal' | 'large';
  className?: string;
}

export function ResponsiveCard({
  children,
  size = 'normal',
  className
}: ResponsiveCardProps) {
  const sizeClasses = {
    compact: 'rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6',
    normal: 'rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8',
    large: 'rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12'
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'caption';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function ResponsiveText({
  children,
  variant = 'body',
  className,
  as
}: ResponsiveTextProps) {
  const variantClasses = {
    h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold',
    h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    h4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h5: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base lg:text-lg',
    caption: 'text-xs sm:text-sm'
  };

  const Component = as || (variant.startsWith('h') ? variant : 'p');

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  gap?: 'small' | 'normal' | 'large';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}

export function ResponsiveStack({
  children,
  direction = 'vertical',
  gap = 'normal',
  align = 'stretch',
  justify = 'start',
  className
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    responsive: 'flex flex-col lg:flex-row'
  };

  const gapClasses = {
    small: 'gap-2 sm:gap-3',
    normal: 'gap-4 sm:gap-6',
    large: 'gap-6 sm:gap-8 lg:gap-12'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  return (
    <div
      className={cn(
        directionClasses[direction],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}
