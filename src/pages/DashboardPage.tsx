import { useMsal } from '@azure/msal-react';
import { useGetMyShopsQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';

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
    </div>
  );
}
