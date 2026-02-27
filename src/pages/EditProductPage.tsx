import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProductByIdQuery, useUpdateProductMutation } from '../store/api/generatedApi';

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

  if (isLoading) return <p className="text-gray-500">Loading product...</p>;
  if (isError || !product) return <p className="text-red-500">Failed to load product.</p>;

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
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      {isUpdateError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Failed to update product.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
