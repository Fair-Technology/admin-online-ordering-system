import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetProductsByShopQuery, useUpdateProductMutation } from '../services/api';
import type { ProductResponse } from '../services/api';
import { glassButtonClass } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';

function AvailabilityToggle({
  product,
  shopId,
}: {
  product: ProductResponse;
  shopId: string;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  const isAvailable = product.isAvailable !== false;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateProduct({
        productId: product.id!,
        updateProductRequest: { shopId, isAvailable: !isAvailable },
      }).unwrap();
    } catch {
      // list retains the unchanged value on failure
    }
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 mt-2" onClick={stop}>
        <button
          disabled={isLoading}
          onClick={handleConfirm}
          className="text-xs px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/20 disabled:opacity-40 transition-colors"
        >
          {isLoading
            ? '…'
            : isAvailable
              ? t('products.confirmDisable')
              : t('products.confirmEnable')}
        </button>
        <button
          disabled={isLoading}
          onClick={(e) => { stop(e); setConfirming(false); }}
          className="text-xs px-2 py-0.5 rounded-md bg-transparent hover:bg-white/10 text-white/50 border border-white/15 disabled:opacity-40 transition-colors"
        >
          {t('products.cancelToggle')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { stop(e); setConfirming(true); }}
      className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
        isAvailable
          ? 'bg-emerald-500/15 border-emerald-400/25 text-emerald-300 hover:bg-emerald-500/25'
          : 'bg-white/8 border-white/12 text-white/40 hover:bg-white/15 hover:text-white/60'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-white/30'}`} />
      {isAvailable ? t('products.available') : t('products.unavailable')}
    </button>
  );
}

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
        <AvailabilityToggle product={product} shopId={shopId} />
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
  const { t } = useTranslation();
  const { data: products, isLoading, isError } = useGetProductsByShopQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label={t('products.loading')} />;
  if (isError) return <p className="text-red-400">{t('products.loadError')}</p>;

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
          {t('products.addProduct')}
        </Link>
      </div>

      {isEmpty && <p className="text-white/40 text-sm">{t('products.empty')}</p>}

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
            {t('products.uncategorized')}
          </h2>
          <ProductGrid products={uncategorized} shopId={shopId!} />
        </section>
      )}
    </div>
  );
}
