import { Link } from 'react-router-dom';
import { useGetMyShopsQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { glassButtonClass } from '../components/ui/GlassButton';

export function ShopsPage() {
  const { data, isLoading, isError } = useGetMyShopsQuery();

  if (isLoading) return <p className="text-white/50">Loading shops...</p>;
  if (isError) return <p className="text-red-400">Failed to load shops.</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Shops</h1>
        <Link to="/shops/new" className={glassButtonClass()}>
          + New Shop
        </Link>
      </div>

      <GlassCard>
        {data?.shops.length === 0 && (
          <p className="p-5 text-white/40 text-sm">No shops yet.</p>
        )}
        {data?.shops.map((shop, i) => (
          <div
            key={shop.id}
            className={`flex items-center justify-between px-5 py-4 ${
              i > 0 ? 'border-t border-white/8' : ''
            }`}
          >
            <div>
              <p className="font-medium text-white">{shop.name}</p>
              <p className="text-sm text-white/40 mt-0.5">/{shop.slug}</p>
            </div>
            <Link to={`/shops/${shop.id}`} className={glassButtonClass('secondary', 'sm')}>
              Manage
            </Link>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
