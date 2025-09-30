import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonProps } from '../../types';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out focus-visible relative overflow-hidden group';

    const variants = {
      primary:
        'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] rounded-xl border border-white/10',
      secondary:
        'glass-interactive text-slate-100 hover:text-white rounded-xl shadow-md',
      outline:
        'border-2 border-white/20 text-slate-200 hover:bg-white/5 hover:border-white/30 hover:text-white rounded-xl backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]',
      ghost:
        'text-slate-300 hover:text-white hover:bg-white/5 rounded-lg backdrop-blur-sm'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base'
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'cursor-wait',
          isDisabled && 'opacity-50 cursor-not-allowed hover:scale-100',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Shimmer effect on hover */}
        {variant === 'primary' && !isDisabled && (
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}

        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {children}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
