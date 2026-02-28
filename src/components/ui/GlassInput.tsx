import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const BASE =
  'w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white ' +
  'placeholder:text-white/35 focus:outline-none focus:border-white/45 focus:bg-white/15 ' +
  'transition-all duration-150 backdrop-blur-sm';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function GlassInput({ label, className = '', ...props }: GlassInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</label>
      )}
      <input className={`${BASE} ${className}`} {...props} />
    </div>
  );
}

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function GlassTextarea({ label, className = '', ...props }: GlassTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</label>
      )}
      <textarea className={`${BASE} resize-none ${className}`} {...props} />
    </div>
  );
}
