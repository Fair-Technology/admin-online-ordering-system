import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCreateProductMutation,
  useGetCategoriesByShopQuery,
  useGenerateUploadUrlMutation,
  useAddProductImageMutation,
} from '../store/api/generatedApi';

export function CreateProductPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [createProduct, { isLoading, isError, error }] = useCreateProductMutation();
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [addProductImage] = useAddProductImageMutation();

  const { data: categories } = useGetCategoriesByShopQuery({ shopId: shopId! });

  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = await createProduct({
        createProductRequest: {
          shopId: shopId!,
          name: form.name,
          description: form.description,
          price: Math.round(Number(form.price) * 100),
          categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        },
      }).unwrap();

      const productId = product.id!;

      if (imageFile) {
        setIsUploading(true);
        const contentType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp';
        const uploadData = await generateUploadUrl({
          shopId: shopId!,
          productId,
          generateImageUploadUrlRequest: { contentType, fileName: imageFile.name },
        }).unwrap();

        await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': contentType,
          },
          body: imageFile,
        });

        await addProductImage({
          shopId: shopId!,
          productId,
          addProductImageRequest: { imageId: uploadData.imageId, url: uploadData.blobUrl },
        }).unwrap();
      }

      navigate(`/shops/${shopId}/products/${productId}`);
    } catch {
      setIsUploading(false);
    }
  };

  const buttonLabel = isLoading ? 'Creating...' : isUploading ? 'Uploading image...' : 'Create Product';
  const isBusy = isLoading || isUploading;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Product</h1>
      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {(error as { data?: { error?: string } })?.data?.error ?? 'Failed to create product.'}
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

        {categories && categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id!)}
                    onChange={() => toggleCategory(cat.id!)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imageFile && (
            <p className="mt-1 text-xs text-gray-500">{imageFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
