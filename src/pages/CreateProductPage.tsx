import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useCreateProductMutation,
  useGetCategoriesByShopQuery,
  useGenerateUploadUrlMutation,
  useAddProductImageMutation,
  useGetShopByIdQuery,
} from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassTextarea } from '../components/ui/GlassInput';
import { CategoryPicker } from '../components/ui/CategoryPicker';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export function CreateProductPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: shop } = useGetShopByIdQuery({ shopId: shopId! });
  const [createProduct, { isLoading, isError, error }] = useCreateProductMutation();
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [addProductImage] = useAddProductImageMutation();

  const { data: categories } = useGetCategoriesByShopQuery({ shopId: shopId! });

  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
          taxRateId: selectedTaxRateId,
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

      navigate(`/shops/${shopId}`);
    } catch {
      setIsUploading(false);
    }
  };

  const isBusy = isLoading || isUploading;
  const buttonLabel = isLoading
    ? t('products.creating')
    : isUploading
      ? t('products.uploadingImage')
      : t('products.create');

  return (
    <div className="max-w-lg space-y-5">
      <Breadcrumb items={[
        { label: t('nav.shops'), to: '/shops' },
        { label: shop?.name ?? t('shops.shop'), to: `/shops/${shopId}` },
        { label: t('products.newProduct') },
      ]} />
      <h1 className="text-2xl font-semibold text-white">{t('products.createTitle')}</h1>

      {isError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">
            {(error as { data?: { error?: string } })?.data?.error ?? t('products.failedToCreate')}
          </p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label={t('products.name')}
            type="text"
            required
            placeholder={t('products.namePlaceholder')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <GlassTextarea
            label={t('products.description')}
            required
            placeholder={t('products.descriptionPlaceholder')}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <GlassInput
            label={t('products.price')}
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />

          {categories && categories.length > 0 && (
            <CategoryPicker
              label={t('products.categories')}
              categories={categories}
              selectedIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
            />
          )}

          {shop?.taxRates && shop.taxRates.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">
                {t('products.taxRate')}
              </label>
              <select
                value={selectedTaxRateId ?? ''}
                onChange={(e) => setSelectedTaxRateId(e.target.value || null)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/45"
              >
                <option value="" className="bg-gray-900 text-white">
                  {t('products.taxRateNone')}
                </option>
                {shop.taxRates.map((rate) => (
                  <option key={rate.id} value={rate.id} className="bg-gray-900 text-white">
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
              {t('products.image')}{' '}
              <span className="text-white/25 normal-case font-normal">{t('products.imageOptionalNote')}</span>
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
