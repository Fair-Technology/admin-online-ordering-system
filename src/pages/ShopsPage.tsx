import { Link } from 'react-router-dom';
import { useGetMyShopsQuery } from '../store/api/generatedApi';

export function ShopsPage() {
  const { data, isLoading, isError } = useGetMyShopsQuery();

  if (isLoading) return <p className="text-gray-500">Loading shops...</p>;
  if (isError) return <p className="text-red-500">Failed to load shops.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
        <Link
          to="/shops/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          New Shop
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {data?.shops.length === 0 && (
          <p className="p-4 text-gray-500">No shops yet.</p>
        )}
        {data?.shops.map((shop) => (
          <div key={shop.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{shop.name}</p>
              <p className="text-sm text-gray-500">/{shop.slug}</p>
            </div>
            <Link
              to={`/shops/${shop.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
