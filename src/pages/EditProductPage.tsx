import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useGetShopByIdQuery,
  useGenerateUploadUrlMutation,
  useAddProductImageMutation,
} from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassTextarea } from '../components/ui/GlassInput';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { X } from 'lucide-react';

export function EditProductPage() {
  const { shopId, productId } = useParams<{ shopId: string; productId: string }>();
  const navigate = useNavigate();
  const { data: shop } = useGetShopByIdQuery({ shopId: shopId! });
  const { data: product, isLoading, isError } = useGetProductByIdQuery({
    productId: productId!,
    shopId: shopId!,
  });
  const [updateProduct, { isLoading: isUpdating, isError: isUpdateError }] =
    useUpdateProductMutation();
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [addProductImage] = useAddProductImageMutation();

  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!imageFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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
    try {
      await updateProduct({
        productId: productId!,
        updateProductRequest: {
          shopId: shopId!,
          name: form.name,
          description: form.description,
          price: Math.round(Number(form.price) * 100),
        },
      }).unwrap();

      if (imageFile) {
        setIsUploading(true);
        const contentType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp';
        const uploadData = await generateUploadUrl({
          shopId: shopId!,
          productId: productId!,
          generateImageUploadUrlRequest: { contentType, fileName: imageFile.name },
        }).unwrap();

        await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': contentType },
          body: imageFile,
        });

        await addProductImage({
          shopId: shopId!,
          productId: productId!,
          addProductImageRequest: { imageId: uploadData.imageId, url: uploadData.blobUrl },
        }).unwrap();

        setIsUploading(false);
        setImageFile(null);
      }
    } catch {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <Breadcrumb items={[
        { label: 'Shops', to: '/shops' },
        { label: shop?.name ?? 'Shop', to: `/shops/${shopId}` },
        { label: 'Products', to: `/shops/${shopId}` },
        { label: product.name ?? 'Product' },
      ]} />
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

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
              Product Image
            </p>
            {(() => {
              const currentUrl = product.images?.find((img) => img.isPrimary)?.url ?? product.images?.[0]?.url;
              return (currentUrl || previewUrl) ? (
                <div className="flex items-start gap-4">
                  {currentUrl && (
                    <div className="flex flex-col gap-1 items-center">
                      <div className="relative">
                        <img src={currentUrl} alt="Current" className={`w-24 h-24 rounded-xl object-cover ${previewUrl ? 'opacity-50' : ''}`} />
                        {previewUrl && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                            <X className="w-8 h-8 text-white/80" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/35">Current</span>
                    </div>
                  )}
                  {previewUrl && (
                    <div className="flex flex-col gap-1 items-center">
                      <img src={previewUrl} alt="New" className="w-24 h-24 rounded-xl object-cover" />
                      <span className="text-xs text-white/35">New</span>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white/45 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/15 file:text-white/75 hover:file:bg-white/20 cursor-pointer"
            />
          </div>

          <div className="flex gap-3">
            <GlassButton
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={isUpdating || isUploading}
              onClick={() => navigate(-1)}
            >
              Cancel
            </GlassButton>
            <GlassButton type="submit" disabled={isUpdating || isUploading} className="flex-1">
              {isUpdating ? 'Saving...' : isUploading ? 'Uploading image...' : 'Save Changes'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
