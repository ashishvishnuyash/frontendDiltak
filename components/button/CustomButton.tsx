'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: ReactNode;
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variants = {
      primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10',
      secondary: 'bg-secondary/80 hover:bg-secondary text-foreground border border-border',
      outline: 'bg-transparent hover:bg-secondary/50 text-foreground border border-border',
      ghost: 'bg-transparent hover:bg-secondary/30 text-foreground',
      danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/10',
      success: 'bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/10',
      warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10',
    };

    // Size styles
    const sizes = {
      xs: 'px-3 h-8 text-xs gap-1.5',
      sm: 'px-4 h-9 text-sm gap-1.5',
      md: 'px-6 h-11 text-sm gap-2',
      lg: 'px-8 h-12 text-base gap-2',
      xl: 'px-10 h-14 text-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className={cn('animate-spin', size === 'xs' ? 'h-3 w-3' : 'h-4 w-4')} />
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children && <span className={cn(loading && 'ml-2')}>{children}</span>}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export { CustomButton };