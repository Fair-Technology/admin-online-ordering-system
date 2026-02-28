import { useParams, Link } from 'react-router-dom';
import { useGetProductsByShopQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { glassButtonClass } from '../components/ui/GlassButton';

export function ProductsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: products, isLoading, isError } = useGetProductsByShopQuery({ shopId: shopId! });

  if (isLoading) return <p className="text-white/50">Loading products...</p>;
  if (isError) return <p className="text-red-400">Failed to load products.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to={`/shops/${shopId}/products/new`} className={glassButtonClass()}>
          + Add Product
        </Link>
      </div>

      <GlassCard>
        {products?.length === 0 && (
          <p className="p-5 text-white/40 text-sm">No products yet.</p>
        )}
        {products?.map((product, i) => (
          <div
            key={product.id}
            className={`flex items-center justify-between px-5 py-4 ${
              i > 0 ? 'border-t border-white/8' : ''
            }`}
          >
            <div>
              <p className="font-medium text-white">{product.name}</p>
              <p className="text-sm text-white/40 mt-0.5">
                ${((product.price ?? 0) / 100).toFixed(2)}
              </p>
            </div>
            <Link
              to={`/shops/${shopId}/products/${product.id}`}
              className={glassButtonClass('secondary', 'sm')}
            >
              Edit
            </Link>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
