import { useParams, Link } from 'react-router-dom';
import { useGetShopByIdQuery, useUpdateShopMutation } from '../store/api/generatedApi';

export function ShopDetailPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: shop, isLoading, isError } = useGetShopByIdQuery({ shopId: shopId! });
  const [updateShop, { isLoading: isUpdating }] = useUpdateShopMutation();

  if (isLoading) return <p className="text-gray-500">Loading shop...</p>;
  if (isError || !shop) return <p className="text-red-500">Failed to load shop.</p>;

  const handleToggleOrders = async () => {
    await updateShop({ shopId: shopId!, updateShopRequest: { acceptingOrders: !(shop as { acceptingOrders?: boolean }).acceptingOrders } });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{shop.name}</h1>
      <p className="text-sm text-gray-500 mb-6">ID: {shop.id} · Slug: /{shop.slug}</p>

      <div className="flex gap-3 mb-8">
        <Link
          to={`/shops/${shopId}/categories`}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Categories
        </Link>
        <Link
          to={`/shops/${shopId}/products`}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Products
        </Link>
        <button
          onClick={handleToggleOrders}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isUpdating ? 'Updating...' : 'Toggle Orders'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
        <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(shop, null, 2)}</pre>
      </div>
    </div>
  );
}
