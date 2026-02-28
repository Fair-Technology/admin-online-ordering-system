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
          <Link
            key={shop.id}
            to={`/shops/${shop.id}`}
            className={`flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors ${
              i > 0 ? 'border-t border-white/8' : ''
            }`}
          >
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {shop.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <p className="font-medium text-white">{shop.name}</p>
          </Link>
        ))}
      </GlassCard>
    </div>
  );
}
