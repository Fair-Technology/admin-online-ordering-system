import { useParams } from 'react-router-dom';
import { useGetShopByIdQuery } from '../store/api/generatedApi';

export function ShopSettingsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: shop, isLoading, isError } = useGetShopByIdQuery({ shopId: shopId! });

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (isError || !shop) return <p className="text-red-500">Failed to load shop.</p>;

  return (
    <div className="max-w-lg">
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        <div className="p-4 flex justify-between text-sm">
          <span className="text-gray-500">Name</span>
          <span className="font-medium text-gray-900">{shop.name}</span>
        </div>
        <div className="p-4 flex justify-between text-sm">
          <span className="text-gray-500">ID</span>
          <span className="font-mono text-gray-700">{shop.id}</span>
        </div>
        <div className="p-4 flex justify-between text-sm">
          <span className="text-gray-500">Slug</span>
          <span className="font-mono text-gray-700">/{shop.slug}</span>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 text-sm">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Debug</p>
        <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(shop, null, 2)}</pre>
      </div>
    </div>
  );
}
