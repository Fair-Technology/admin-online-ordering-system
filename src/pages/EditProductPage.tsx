import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProductByIdQuery, useUpdateProductMutation } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassTextarea } from '../components/ui/GlassInput';
import { GlassSpinner } from '../components/ui/GlassSpinner';

export function EditProductPage() {
  const { shopId, productId } = useParams<{ shopId: string; productId: string }>();
  const { data: product, isLoading, isError } = useGetProductByIdQuery({
    productId: productId!,
    shopId: shopId!,
  });
  const [updateProduct, { isLoading: isUpdating, isError: isUpdateError }] =
    useUpdateProductMutation();

  const [form, setForm] = useState({ name: '', description: '', price: '' });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        price: ((product.price ?? 0) / 100).toFixed(2),
      });
    }
  }, [product]);

  if (isLoading) return <GlassSpinner label="Loading product..." />;
  if (isError || !product) return <p className="text-red-400">Failed to load product.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProduct({
      productId: productId!,
      updateProductRequest: {
        shopId: shopId!,
        name: form.name,
        description: form.description,
        price: Math.round(Number(form.price) * 100),
      },
    });
  };

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-semibold text-white">Edit Product</h1>

      {isUpdateError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">Failed to update product.</p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <GlassTextarea
            label="Description"
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <GlassInput
            label="Price ($)"
            type="number"
            required
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <GlassButton type="submit" disabled={isUpdating} className="w-full">
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
