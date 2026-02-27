import { useParams, Link } from 'react-router-dom';
import { useGetCategoriesByShopQuery } from '../store/api/generatedApi';

export function CategoriesPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: categories, isLoading, isError } = useGetCategoriesByShopQuery({ shopId: shopId! });

  if (isLoading) return <p className="text-gray-500">Loading categories...</p>;
  if (isError) return <p className="text-red-500">Failed to load categories.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Link
          to={`/shops/${shopId}/categories/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          New Category
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {categories?.length === 0 && (
          <p className="p-4 text-gray-500">No categories yet.</p>
        )}
        {categories?.map((cat) => (
          <div key={cat.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{cat.name}</p>
              <p className="text-sm text-gray-500">Sort: {cat.sortOrder ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
