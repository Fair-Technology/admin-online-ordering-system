import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-white/20 hover:bg-white/30 border border-white/25 text-white',
  secondary: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white/80',
  ghost:     'bg-transparent hover:bg-white/10 border border-white/15 text-white/65 hover:text-white',
  danger:    'bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 hover:text-red-200',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
};

const BASE =
  'inline-flex items-center justify-center font-medium backdrop-blur-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';

export function GlassButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={`${BASE} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Use this on <Link> elements to get GlassButton appearance without nesting button inside <a>. */
export function glassButtonClass(
  variant: Variant = 'primary',
  size: Size = 'md',
  extra = '',
): string {
  return `${BASE} ${variantClasses[variant]} ${sizeClasses[size]} ${extra}`.trim();
}
