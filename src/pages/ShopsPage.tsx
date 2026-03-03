import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetMyShopsQuery } from '../services/api';
import { glassButtonClass } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';

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
            to={`/shops/${shop.id}`}
            key={shop.id}
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
