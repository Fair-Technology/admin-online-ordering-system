import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useGetMyShopsQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassSpinner } from '../components/ui/GlassSpinner';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetMyShopsQuery();
  const { accounts } = useMsal();
  const user = accounts[0];
  const shopCount = data?.shops.length ?? 0;
  const firstName = user?.name?.split(' ')[0] ?? null;

  if (isFetching) {
    return <GlassSpinner label={t('dashboard.loading')} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          {firstName ? t('dashboard.welcomeBack', { name: firstName }) : t('dashboard.title')}
        </h1>
        <p className="text-white/45 mt-1 text-sm">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs font-medium text-white/45 uppercase tracking-wider mb-2">{t('dashboard.totalShops')}</p>
          <p className="text-4xl font-semibold text-white">{shopCount}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs font-medium text-white/45 uppercase tracking-wider mb-2">{t('dashboard.active')}</p>
          <p className="text-4xl font-semibold text-white">{shopCount}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs font-medium text-white/45 uppercase tracking-wider mb-2">{t('dashboard.status')}</p>
          <p className="text-sm text-white/75 mt-2">{t('dashboard.allSystemsOperational')}</p>
        </GlassCard>
      </div>
    </div>
  );
}
