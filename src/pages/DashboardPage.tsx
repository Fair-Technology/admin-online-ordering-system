import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useGetMyShopsQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { glassButtonClass } from '../components/ui/GlassButton';

export function DashboardPage() {
  const { data, isLoading } = useGetMyShopsQuery();
  const { accounts } = useMsal();
  const user = accounts[0];
  const shopCount = data?.shops.length ?? 0;
  const firstName = user?.name?.split(' ')[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
        </h1>
        <p className="text-white/45 mt-1 text-sm">Manage your shops and products</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs font-medium text-white/45 uppercase tracking-wider mb-2">Total Shops</p>
          <p className="text-4xl font-semibold text-white">{isLoading ? '—' : shopCount}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs font-medium text-white/45 uppercase tracking-wider mb-2">Active</p>
          <p className="text-4xl font-semibold text-white">{isLoading ? '—' : shopCount}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs font-medium text-white/45 uppercase tracking-wider mb-2">Status</p>
          <p className="text-sm text-white/75 mt-2">All systems operational</p>
        </GlassCard>
      </div>

      {/* Shops */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-white/80">Your Shops</h2>
          <Link to="/shops/new" className={glassButtonClass('primary', 'sm')}>
            + New Shop
          </Link>
        </div>

        <GlassCard>
          {isLoading && <p className="p-5 text-white/40">Loading...</p>}
          {!isLoading && shopCount === 0 && (
            <div className="p-10 text-center">
              <p className="text-white/35 mb-4 text-sm">No shops yet. Create your first one.</p>
              <Link to="/shops/new" className={glassButtonClass()}>
                Create Shop
              </Link>
            </div>
          )}
          {!isLoading &&
            data?.shops.map((shop, i) => (
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
    </div>
  );
}
