import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesByShopQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { glassButtonClass } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';

export function CategoriesPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useGetCategoriesByShopQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label={t('categories.loading')} />;
  if (isError) return <p className="text-red-400">{t('categories.loadError')}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to={`/shops/${shopId}/categories/new`} className={glassButtonClass()}>
          {t('categories.addCategory')}
        </Link>
      </div>

      <GlassCard>
        {categories?.length === 0 && (
          <p className="p-5 text-white/40 text-sm">{t('categories.empty')}</p>
        )}
        {categories?.map((cat, i) => (
          <div
            key={cat.id}
            className={`flex items-center justify-between px-5 py-4 ${
              i > 0 ? 'border-t border-white/8' : ''
            }`}
          >
            <div>
              <p className="font-medium text-white">{cat.name}</p>
              <p className="text-sm text-white/40 mt-0.5">{t('categories.sort')} {cat.sortOrder ?? '—'}</p>
            </div>
            <Link
              to={`/shops/${shopId}/categories/${cat.id}/edit`}
              className={glassButtonClass('secondary', 'sm')}
            >
              {t('categories.edit')}
            </Link>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
