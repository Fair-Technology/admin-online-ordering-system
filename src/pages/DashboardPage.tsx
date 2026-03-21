import { useState, useEffect, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useGetMyShopsQuery, useGetOrdersByShopQuery } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassSpinner } from '../components/ui/GlassSpinner';

function ShopOrdersLoader({
  shopId,
  onData,
}: {
  shopId: string;
  onData: (shopId: string, total: number) => void;
}) {
  const { data } = useGetOrdersByShopQuery({ shopId, page: 1, pageSize: 1 });
  const onDataRef = useRef(onData);
  onDataRef.current = onData;
  useEffect(() => {
    if (data) onDataRef.current(shopId, data.total);
  }, [shopId, data]);
  return null;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetMyShopsQuery();
  const { accounts } = useMsal();
  const user = accounts[0];
  const shopCount = data?.shops.length ?? 0;
  const firstName = user?.name?.split(' ')[0] ?? null;

  const [totalsMap, setTotalsMap] = useState<Record<string, number>>({});
  const handleShopOrders = (shopId: string, total: number) =>
    setTotalsMap((prev) => ({ ...prev, [shopId]: total }));

  const shops = data?.shops ?? [];
  const totalOrders = Object.values(totalsMap).reduce((sum, n) => sum + n, 0);
  const ordersLoaded = shops.length > 0 && shops.every((s) => totalsMap[s.id!] !== undefined);

  if (isFetching) {
    return <GlassSpinner label={t('dashboard.loading')} />;
  }

  return (
    <div className="space-y-6">
      {shops.map((s) => (
        <ShopOrdersLoader key={s.id} shopId={s.id!} onData={handleShopOrders} />
      ))}

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {firstName ? t('dashboard.welcomeBack', { name: firstName }) : t('dashboard.title')}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            {t('dashboard.totalShops')}
          </p>
          <p className="text-4xl font-semibold text-gray-900">{shopCount}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            {t('dashboard.totalOrders')}
          </p>
          <p className="text-4xl font-semibold text-gray-900">
            {ordersLoaded ? totalOrders : '—'}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
