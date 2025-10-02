import { TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  description?: string;
  error?: string;
}

export function TextareaField({
  label,
  id,
  description,
  error,
  className = "",
  required,
  ...props
}: TextareaFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold uppercase tracking-wide text-black mb-2">
        {label}
        {required && <span className="text-[#E91E63] ml-1">*</span>}
      </label>
      <div className="mt-1">
        <textarea
          id={id}
          rows={4}
          className={clsx(
            "block w-full px-4 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] text-black placeholder-gray-500 font-medium resize-y transition-all duration-150 min-h-[120px]",
            "focus:outline-none focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3] focus:translate-x-[-1px] focus:translate-y-[-1px]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[#F44336] shadow-[4px_4px_0px_#F44336]",
            className
          )}
          required={required}
          {...props}
        />
      </div>
      {description && !error && (
        <p className="mt-2 text-sm text-gray-700">{description}</p>
      )}
      {error && (
        <p className="mt-2 text-sm font-medium text-[#F44336]">{error}</p>
      )}
    </div>
  );
}
