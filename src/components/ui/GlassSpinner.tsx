interface GlassSpinnerProps {
  label?: string;
}

export function GlassSpinner({ label }: GlassSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 flex-1 min-h-48">
      <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
