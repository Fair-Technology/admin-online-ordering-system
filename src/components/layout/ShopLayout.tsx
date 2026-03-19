import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMsal } from '@azure/msal-react';
import { useGetShopByIdQuery } from '../../services/api';
import { GlassSpinner } from '../ui/GlassSpinner';
import { Breadcrumb } from '../ui/Breadcrumb';
import { ShopRoleContext } from '../../features/shops/ShopRoleContext';

export function ShopLayout() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const { accounts } = useMsal();
  const currentUserId = accounts[0]?.localAccountId;
  const { data: shop, isLoading, isError } = useGetShopByIdQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label={t('shops.loadingShop')} />;
  if (isError || !shop) return <p className="text-red-400">{t('shops.failedToLoadShop')}</p>;

  const role = (shop.members ?? []).find(
    (m) => m.userId === currentUserId && m.isActive,
  )?.role ?? null;

  const isOwner = role === 'owner';

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
      isActive
        ? 'bg-white/20 text-white backdrop-blur-md border border-white/20'
        : 'text-white/50 hover:text-white hover:bg-white/10'
    }`;

  return (
    <ShopRoleContext.Provider value={role}>
      <div>
        <Breadcrumb items={[{ label: t('nav.shops'), to: '/shops' }, { label: shop.name ?? t('shops.shop') }]} />
        <h1 className="text-2xl font-semibold text-white mb-4">{shop.name}</h1>

        <div className="flex gap-2 mb-6">
          <NavLink to={`/shops/${shopId}/orders`} className={tabClass}>
            {t('nav.orders')}
          </NavLink>
          <NavLink to={`/shops/${shopId}`} end className={tabClass}>
            {t('nav.products')}
          </NavLink>
          <NavLink to={`/shops/${shopId}/categories`} className={tabClass}>
            {t('nav.categories')}
          </NavLink>
          <NavLink to={`/shops/${shopId}/subscription`} className={tabClass}>
            {t('nav.subscription')}
          </NavLink>
          {isOwner && (
            <NavLink to={`/shops/${shopId}/settings`} className={tabClass}>
              {t('nav.settings')}
            </NavLink>
          )}
        </div>

        <Outlet />
      </div>
    </ShopRoleContext.Provider>
  );
}
