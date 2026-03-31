import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-gray-900 text-white hover:bg-gray-800 border border-gray-900',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
  ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent',
  danger:    'bg-white text-red-600 border border-red-200 hover:bg-red-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
};

const BASE =
  'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';

export function MyButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: MyButtonProps) {
  return (
    <button
      className={`${BASE} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Use this on <Link> elements to get MyButton appearance without nesting button inside <a>. */
export function myButtonLinkClass(
  variant: Variant = 'primary',
  size: Size = 'md',
  extra = '',
): string {
  return `${BASE} ${variantClasses[variant]} ${sizeClasses[size]} ${extra}`.trim();
}
