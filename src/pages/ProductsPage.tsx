import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetProductsByShopQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { glassButtonClass } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';

export function ProductsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useGetProductsByShopQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label="Loading products..." />;
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
        {products?.map((product, i) => {
          const imageUrl = product.images?.find((img) => img.isPrimary)?.url ?? product.images?.[0]?.url;
          return (
          <div
            key={product.id}
            onClick={() => navigate(`/shops/${shopId}/products/${product.id}`)}
            className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors ${
              i > 0 ? 'border-t border-white/8' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-18 h-18 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-18 h-18 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <span className="text-white font-semibold text-xl">
                    {product.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-sm text-white/40 mt-0.5">
                  ${((product.price ?? 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <Link
              to={`/shops/${shopId}/products/${product.id}`}
              className={glassButtonClass('secondary', 'sm')}
              onClick={(e) => e.stopPropagation()}
            >
              Edit
            </Link>
          </div>
        );})}
      </GlassCard>
    </div>
  );
}
