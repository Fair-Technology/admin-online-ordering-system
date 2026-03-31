import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const BASE =
  'w-full border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 ' +
  'px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 ' +
  'disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-150';

interface MyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function MyInput({ label, className = '', ...props }: MyInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input className={`${BASE} ${className}`} {...props} />
    </div>
  );
}

interface MyTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function MyTextarea({ label, className = '', ...props }: MyTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea className={`${BASE} resize-none ${className}`} {...props} />
    </div>
  );
}
