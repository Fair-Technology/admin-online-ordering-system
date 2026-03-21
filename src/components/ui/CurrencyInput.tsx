const BASE =
  'w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 ' +
  'transition-all duration-150';

interface CurrencyInputProps {
  label?: string;
  valueCents: number;
  onChange: (cents: number) => void;
  className?: string;
}

export function CurrencyInput({ label, valueCents, onChange, className = '' }: CurrencyInputProps) {
  const formatted = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueCents / 100);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const digit = parseInt(e.key, 10);
    if (!isNaN(digit) && e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      onChange(Math.min(valueCents * 10 + digit, 99_999_999));
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      onChange(Math.floor(valueCents / 10));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={formatted}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className={`${BASE} ${className}`}
      />
    </div>
  );
}
