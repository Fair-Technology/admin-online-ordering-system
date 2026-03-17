import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetMyShopsQuery, useGetShopSubscriptionQuery } from '../services/api';
import { glassButtonClass } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';

function ShopPlanBadge({ shopId }: { shopId: string }) {
  const { data } = useGetShopSubscriptionQuery({ shopId });
  const navigate = useNavigate();

  if (!data) return null;

  const planName = data.plan?.name ?? 'Free';
  const isActive = data.subscription.status === 'active';

  return (
    <span
      role="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/shops/${shopId}/subscription`);
      }}
      className={`mt-1.5 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
        isActive
          ? 'bg-emerald-500/15 border-emerald-400/25 text-emerald-300 hover:bg-emerald-500/25'
          : 'bg-white/8 border-white/12 text-white/40 hover:bg-white/15 hover:text-white/60'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-white/30'}`} />
      {planName}
    </span>
  );
}

export function ShopsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetMyShopsQuery();

  if (isLoading) return <GlassSpinner label={t('shops.loading')} />;
  if (isError) return <p className="text-red-400">{t('shops.loadError')}</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">{t('shops.title')}</h1>
        <Link to="/shops/new" className={glassButtonClass()}>
          {t('shops.addShop')}
        </Link>
      </div>

      {data?.shops.length === 0 && (
        <p className="text-white/40 text-sm">{t('shops.empty')}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {data?.shops.map((shop) => (
          <Link
            key={shop.id}
            to={`/shops/${shop.id}`}
            className="rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20
                       shadow-[0_8px_40px_rgba(0,0,0,0.35)] hover:bg-white/15
                       hover:border-white/30 cursor-pointer overflow-hidden block"
          >
            <div className="aspect-square w-full bg-white flex items-center justify-center">
              {shop.branding?.logoUrl ? (
                <img src={shop.branding.logoUrl} alt={shop.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-4xl font-semibold text-black/20">
                  {shop.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-white text-sm leading-snug truncate">{shop.name}</p>
              <ShopPlanBadge shopId={shop.id!} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
