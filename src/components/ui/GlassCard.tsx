interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
