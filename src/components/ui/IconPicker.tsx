import {
  Flame, Leaf, Fish, Wheat, Droplets, Heart, Star, Snowflake,
  Zap, Shield, AlertTriangle, Coffee, Utensils, Wine, Beer,
  Cake, IceCream, Carrot, Cherry, Citrus, Egg, TreePine, Sun, Sandwich,
  type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Flame, Leaf, Fish, Wheat, Droplets, Heart, Star, Snowflake,
  Zap, Shield, AlertTriangle, Coffee, Utensils, Wine, Beer,
  Cake, IceCream, Carrot, Cherry, Citrus, Egg, TreePine, Sun, Sandwich,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

interface IconPickerProps {
  value: string | null;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {ICON_NAMES.map((name) => {
        const Icon = ICON_MAP[name];
        const isSelected = value === name;
        return (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              isSelected
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}

export function LucideIconByName({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} />;
}
