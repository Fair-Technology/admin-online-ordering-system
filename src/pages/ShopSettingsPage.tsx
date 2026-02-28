import { useParams } from 'react-router-dom';
import { useGetShopByIdQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';

export function ShopSettingsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: shop, isLoading, isError } = useGetShopByIdQuery({ shopId: shopId! });

  if (isLoading) return <p className="text-white/50">Loading...</p>;
  if (isError || !shop) return <p className="text-red-400">Failed to load shop.</p>;

  const rows = [
    { label: 'Name', value: shop.name, mono: false },
    { label: 'ID', value: shop.id, mono: true },
    { label: 'Slug', value: `/${shop.slug}`, mono: true },
  ];

  return (
    <div className="max-w-lg space-y-4">
      <GlassCard>
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-5 py-4 ${
              i > 0 ? 'border-t border-white/8' : ''
            }`}
          >
            <span className="text-sm text-white/45">{row.label}</span>
            <span className={`text-sm text-white ${row.mono ? 'font-mono' : 'font-medium'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </GlassCard>

      <GlassCard className="p-4">
        <p className="text-xs text-white/25 mb-2 uppercase tracking-wide">Debug</p>
        <pre className="text-white/45 text-xs whitespace-pre-wrap">
          {JSON.stringify(shop, null, 2)}
        </pre>
      </GlassCard>
    </div>
  );
}
