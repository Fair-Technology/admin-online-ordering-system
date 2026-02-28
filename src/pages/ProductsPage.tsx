import { useParams, Link } from 'react-router-dom';
import { useGetProductsByShopQuery } from '../store/api/generatedApi';

export function ProductsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: products, isLoading, isError } = useGetProductsByShopQuery({ shopId: shopId! });

  if (isLoading) return <p className="text-gray-500">Loading products...</p>;
  if (isError) return <p className="text-red-500">Failed to load products.</p>;

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Link
          to={`/shops/${shopId}/products/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Add a product
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {products?.length === 0 && (
          <p className="p-4 text-gray-500">No products yet.</p>
        )}
        {products?.map((product) => (
          <div key={product.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">${((product.price ?? 0) / 100).toFixed(2)}</p>
            </div>
            <Link
              to={`/shops/${shopId}/products/${product.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
