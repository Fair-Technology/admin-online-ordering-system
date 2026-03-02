import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetProductsByShopQuery } from '../store/api/generatedApi';
import type { ProductResponse } from '../store/api/generatedApi';
import { glassButtonClass } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';

function ProductCard({ product, shopId }: { product: ProductResponse; shopId: string }) {
  const navigate = useNavigate();
  const imageUrl = product.images?.length
    ? product.images[product.images.length - 1].url
    : undefined;

  return (
    <div
      onClick={() => navigate(`/shops/${shopId}/products/${product.id}`)}
      className="group cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={product.name} className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-white/10 flex items-center justify-center">
          <span className="text-white/50 font-semibold text-4xl">
            {product.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="p-3">
        <p className="font-medium text-white text-sm leading-snug truncate">{product.name}</p>
        <p className="text-white/50 text-xs mt-0.5">${((product.price ?? 0) / 100).toFixed(2)}</p>
      </div>
    </div>
  );
}

function ProductGrid({ products, shopId }: { products: ProductResponse[]; shopId: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} shopId={shopId} />
      ))}
    </div>
  );
}

export function ProductsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: products, isLoading, isError } = useGetProductsByShopQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label="Loading products..." />;
  if (isError) return <p className="text-red-400">Failed to load products.</p>;

  // Collect unique categories from all products, sorted by sortOrder then name
  const categoryMap = new Map<string, { id: string; name: string; sortOrder: number }>();
  for (const product of products ?? []) {
    for (const cat of product.categories ?? []) {
      if (cat.id && !categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, {
          id: cat.id,
          name: cat.name ?? '',
          sortOrder: cat.sortOrder ?? 0,
        });
      }
    }
  }
  const sortedCategories = [...categoryMap.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );

  // Products in each category
  const byCategory = new Map<string, ProductResponse[]>();
  for (const cat of sortedCategories) {
    byCategory.set(
      cat.id,
      (products ?? []).filter((p) => p.categories?.some((c) => c.id === cat.id)),
    );
  }

  // Products with no categories
  const uncategorized = (products ?? []).filter((p) => !p.categories?.length);

  const isEmpty = !products?.length;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Link to={`/shops/${shopId}/products/new`} className={glassButtonClass()}>
          + Add Product
        </Link>
      </div>

      {isEmpty && <p className="text-white/40 text-sm">No products yet.</p>}

      {sortedCategories.map((cat) => (
        <section key={cat.id}>
          <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
            {cat.name}
          </h2>
          <ProductGrid products={byCategory.get(cat.id)!} shopId={shopId!} />
        </section>
      ))}

      {uncategorized.length > 0 && (
        <section>
          <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
            Uncategorized
          </h2>
          <ProductGrid products={uncategorized} shopId={shopId!} />
        </section>
      )}
    </div>
  );
}
