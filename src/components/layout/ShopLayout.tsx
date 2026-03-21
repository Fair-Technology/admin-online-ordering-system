import { useParams, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMsal } from '@azure/msal-react';
import { useGetShopByIdQuery } from '../../services/api';
import { GlassSpinner } from '../ui/GlassSpinner';
import { ShopRoleContext } from '../../features/shops/ShopRoleContext';

export function ShopLayout() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const { accounts } = useMsal();
  const currentUserId = accounts[0]?.localAccountId;
  const { data: shop, isLoading, isError } = useGetShopByIdQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label={t('shops.loadingShop')} />;
  if (isError || !shop) return <p className="text-red-500">{t('shops.failedToLoadShop')}</p>;

  const role = (shop.members ?? []).find(
    (m) => m.userId === currentUserId && m.isActive,
  )?.role ?? null;

  return (
    <ShopRoleContext.Provider value={role}>
      {shop.isPaused && (
        <div className="bg-red-600 text-white text-sm font-medium px-4 py-2.5 text-center">
          {t('shops.shopPausedBanner')}
        </div>
      )}
      <Outlet />
    </ShopRoleContext.Provider>
  );
}
