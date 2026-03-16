const BASE =
  'w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white ' +
  'placeholder:text-white/35 focus:outline-none focus:border-white/45 focus:bg-white/15 ' +
  'transition-all duration-150 backdrop-blur-sm';

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
        <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</label>
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
