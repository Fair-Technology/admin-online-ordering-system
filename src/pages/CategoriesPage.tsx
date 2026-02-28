import { useParams, Link } from 'react-router-dom';
import { useGetCategoriesByShopQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { glassButtonClass } from '../components/ui/GlassButton';

export function CategoriesPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: categories, isLoading, isError } = useGetCategoriesByShopQuery({ shopId: shopId! });

  if (isLoading) return <p className="text-white/50">Loading categories...</p>;
  if (isError) return <p className="text-red-400">Failed to load categories.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to={`/shops/${shopId}/categories/new`} className={glassButtonClass()}>
          + New Category
        </Link>
      </div>

      <GlassCard>
        {categories?.length === 0 && (
          <p className="p-5 text-white/40 text-sm">No categories yet.</p>
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
              <p className="text-sm text-white/40 mt-0.5">Sort: {cat.sortOrder ?? '—'}</p>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
