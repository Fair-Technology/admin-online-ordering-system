interface MyCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function MyCard({ children, className = '', id }: MyCardProps) {
  return (
    <div
      id={id}
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
