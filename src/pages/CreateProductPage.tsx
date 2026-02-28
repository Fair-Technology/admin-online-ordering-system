import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCreateProductMutation,
  useGetCategoriesByShopQuery,
  useGenerateUploadUrlMutation,
  useAddProductImageMutation,
} from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassTextarea } from '../components/ui/GlassInput';

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
          headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': contentType },
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

  const isBusy = isLoading || isUploading;
  const buttonLabel = isLoading ? 'Creating...' : isUploading ? 'Uploading image...' : 'Create Product';

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-semibold text-white">Create Product</h1>

      {isError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">
            {(error as { data?: { error?: string } })?.data?.error ?? 'Failed to create product.'}
          </p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Name"
            type="text"
            required
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <GlassTextarea
            label="Description"
            required
            placeholder="Describe your product..."
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
            placeholder="0.00"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />

          {categories && categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Categories</p>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2.5 text-sm text-white/65 cursor-pointer hover:text-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id!)}
                      onChange={() => toggleCategory(cat.id!)}
                      className="rounded border-white/30 bg-white/10 accent-white/80 focus:ring-white/20"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
              Product Image{' '}
              <span className="text-white/25 normal-case font-normal">(optional)</span>
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white/45 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/15 file:text-white/75 hover:file:bg-white/20 cursor-pointer"
            />
            {imageFile && <p className="text-xs text-white/35">{imageFile.name}</p>}
          </div>

          <GlassButton type="submit" disabled={isBusy} className="w-full">
            {buttonLabel}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
