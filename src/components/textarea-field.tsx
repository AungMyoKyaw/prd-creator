import { TextareaHTMLAttributes } from "react";

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  description?: string;
}

export function TextareaField({
  label,
  id,
  description,
  className = "",
  ...props
}: TextareaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="mt-1">
        <textarea
          id={id}
          className={`block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition ${className}`}
          {...props}
        />
      </div>
      {description ? (
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
