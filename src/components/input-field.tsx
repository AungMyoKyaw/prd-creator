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
        className="mb-2 block text-sm font-semibold tracking-wide text-black uppercase"
      >
        {label}
        {required && <span className="ml-1 text-[#E91E63]">*</span>}
      </label>
      <input
        id={id}
        className={clsx(
          'block w-full border-[3px] border-black bg-white px-4 py-3 font-medium text-black placeholder-gray-500 shadow-[4px_4px_0px_#000] transition-all duration-150',
          'focus:translate-x-[-1px] focus:translate-y-[-1px] focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3] focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
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
