import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';
import type { InputFieldProps } from '../../types';

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, description, error, className, ...props }, ref) => {
    const generatedId = React.useId();
    const id = props.id ?? generatedId;

    return (
      <div className="space-y-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-200 mb-1"
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              'flex w-full rounded-lg border border-slate-600 glass glass-hover',
              'px-3 py-2 text-sm text-white placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />

          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>

        {description && !error && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}

        {error && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
