interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
