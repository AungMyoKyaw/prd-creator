import { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export function InputField({
  label,
  id,
  error,
  className = '',
  required,
  ...props
}: InputFieldProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-semibold uppercase tracking-wide text-black mb-2"
      >
        {label}
        {required && <span className="text-[#E91E63] ml-1">*</span>}
      </label>
      <input
        id={id}
        className={clsx(
          'block w-full px-4 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] text-black placeholder-gray-500 font-medium transition-all duration-150',
          'focus:outline-none focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3] focus:translate-x-[-1px] focus:translate-y-[-1px]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[#F44336] shadow-[4px_4px_0px_#F44336]',
          className
        )}
        required={required}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-[#F44336]">{error}</p>
      )}
    </div>
  );
}
