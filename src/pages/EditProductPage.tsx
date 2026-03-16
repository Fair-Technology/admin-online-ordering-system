import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ProductSchedule } from '../services/api';
import {
  useGetProductByIdQuery,
  useGetShopByIdQuery,
  useGenerateUploadUrlMutation,
  useAddProductImageMutation,
  useDeleteProductMutation,
} from '../services/api';
import { useUpdateProductMutation, useGetCategoriesByShopQuery } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassTextarea } from '../components/ui/GlassInput';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { CategoryPicker } from '../components/ui/CategoryPicker';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { X } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

type VariantOption = { id: string; name: string; priceDelta: number; isAvailable: boolean };
type VariantGroup  = { id: string; name: string; options: VariantOption[] };
type AddonOption   = { id: string; name: string; priceDelta: number; isAvailable: boolean };
type AddonGroup    = { id: string; name: string; minSelectable: number; maxSelectable: number; options: AddonOption[] };

export function EditProductPage() {
  const { shopId, productId } = useParams<{ shopId: string; productId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: shop } = useGetShopByIdQuery({ shopId: shopId! });
  const currencySymbol = shop?.currency ? getCurrencySymbol(shop.currency) : '$';
  const { data: categories } = useGetCategoriesByShopQuery({ shopId: shopId! });
  const { data: product, isLoading, isError } = useGetProductByIdQuery(
    { productId: productId!, shopId: shopId! },
    { refetchOnMountOrArgChange: true },
  );
  const [updateProduct, { isLoading: isUpdating, isError: isUpdateError }] =
    useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting, isError: isDeleteError }] =
    useDeleteProductMutation();
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [addProductImage] = useAddProductImageMutation();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: 0 });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryError, setCategoryError] = useState(false);
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);
  const [schedule, setSchedule] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [] as number[],
  });
  const [scheduleError, setScheduleError] = useState(false);

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
        price: product.price ?? 0,
      });
      setSelectedCategoryIds(product.categories?.map((c) => c.id!).filter(Boolean) ?? []);
      setSelectedTaxRateId(product.taxRateId ?? null);
      setVariantGroups(
        (product.variantGroups ?? []).map(g => ({
          id: g.id ?? crypto.randomUUID(),
          name: g.name ?? '',
          options: (g.options ?? []).map(o => ({
            id: o.id ?? crypto.randomUUID(),
            name: o.name ?? '',
            priceDelta: o.priceDelta ?? 0,
            isAvailable: o.isAvailable ?? true,
          })),
        }))
      );
      setAddonGroups(
        (product.addonGroups ?? []).map(g => ({
          id: g.id ?? crypto.randomUUID(),
          name: g.name ?? '',
          minSelectable: g.minSelectable ?? 0,
          maxSelectable: g.maxSelectable ?? 1,
          options: (g.options ?? []).map(o => ({
            id: o.id ?? crypto.randomUUID(),
            name: o.name ?? '',
            priceDelta: o.priceDelta ?? 0,
            isAvailable: o.isAvailable ?? true,
          })),
        }))
      );
      if (product.schedule) {
        setScheduleEnabled(true);
        setNoEndDate(!product.schedule.endDate);
        setSchedule({
          startDate: product.schedule.startDate ?? '',
          endDate: product.schedule.endDate ?? '',
          startTime: product.schedule.startTime ?? '',
          endTime: product.schedule.endTime ?? '',
          daysOfWeek: product.schedule.daysOfWeek ?? [],
        });
      }
    }
  }, [product]);


  if (isLoading) return <GlassSpinner label={t('products.loadingProduct')} />;
  if (isError || !product) return <p className="text-red-400">{t('products.failedToLoad')}</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategoryIds.length === 0) {
      setCategoryError(true);
      return;
    }
    setCategoryError(false);

    // Validate schedule
    let scheduleInvalid = false;
    if (scheduleEnabled) {
      const endDateInvalid = !noEndDate && schedule.endDate && schedule.endDate < schedule.startDate;
      const endTimeInvalid = schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime;
      if (endDateInvalid || endTimeInvalid) scheduleInvalid = true;
    }
    setScheduleError(scheduleInvalid);
    if (scheduleInvalid) return;

    let schedulePayload: ProductSchedule | null = null;
    if (scheduleEnabled) {
      schedulePayload = {
        startDate: schedule.startDate,
        endDate: noEndDate ? null : (schedule.endDate || null),
        startTime: schedule.startTime || null,
        endTime: schedule.endTime || null,
        daysOfWeek: schedule.daysOfWeek.length > 0 ? schedule.daysOfWeek : undefined,
      };
    }

    try {
      await updateProduct({
        productId: productId!,
        updateProductRequest: {
          shopId: shopId!,
          name: form.name,
          description: form.description,
          price: form.price,
          categoryIds: selectedCategoryIds,
          variantGroups,
          addonGroups,
          taxRateId: selectedTaxRateId,
          schedule: schedulePayload,
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
      navigate(-1);
    } catch {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct({ shopId: shopId!, productId: productId! }).unwrap();
      navigate(`/shops/${shopId}`);
    } catch {
      setConfirmingDelete(false);
    }
  };

  const addVariantGroup = () => {
    setVariantGroups(gs => [...gs, { id: crypto.randomUUID(), name: '', options: [] }]);
  };

  const removeVariantGroup = (groupId: string) => {
    setVariantGroups(gs => gs.filter(g => g.id !== groupId));
  };

  const updateVariantGroupName = (groupId: string, name: string) => {
    setVariantGroups(gs => gs.map(g => g.id === groupId ? { ...g, name } : g));
  };

  const addVariantOption = (groupId: string) => {
    setVariantGroups(gs => gs.map(g =>
      g.id === groupId
        ? { ...g, options: [...g.options, { id: crypto.randomUUID(), name: '', priceDelta: 0, isAvailable: true }] }
        : g
    ));
  };

  const removeVariantOption = (groupId: string, optionId: string) => {
    setVariantGroups(gs => gs.map(g =>
      g.id === groupId ? { ...g, options: g.options.filter(o => o.id !== optionId) } : g
    ));
  };

  const updateVariantOption = (groupId: string, optionId: string, patch: Partial<VariantOption>) => {
    setVariantGroups(gs => gs.map(g =>
      g.id === groupId
        ? { ...g, options: g.options.map(o => o.id === optionId ? { ...o, ...patch } : o) }
        : g
    ));
  };

  const addAddonGroup = () => {
    setAddonGroups(gs => [...gs, { id: crypto.randomUUID(), name: '', minSelectable: 0, maxSelectable: 1, options: [] }]);
  };

  const removeAddonGroup = (groupId: string) => {
    setAddonGroups(gs => gs.filter(g => g.id !== groupId));
  };

  const updateAddonGroup = (groupId: string, patch: Partial<AddonGroup>) => {
    setAddonGroups(gs => gs.map(g => g.id === groupId ? { ...g, ...patch } : g));
  };

  const addAddonOption = (groupId: string) => {
    setAddonGroups(gs => gs.map(g =>
      g.id === groupId
        ? { ...g, options: [...g.options, { id: crypto.randomUUID(), name: '', priceDelta: 0, isAvailable: true }] }
        : g
    ));
  };

  const removeAddonOption = (groupId: string, optionId: string) => {
    setAddonGroups(gs => gs.map(g =>
      g.id === groupId ? { ...g, options: g.options.filter(o => o.id !== optionId) } : g
    ));
  };

  const updateAddonOption = (groupId: string, optionId: string, patch: Partial<AddonOption>) => {
    setAddonGroups(gs => gs.map(g =>
      g.id === groupId
        ? { ...g, options: g.options.map(o => o.id === optionId ? { ...o, ...patch } : o) }
        : g
    ));
  };

  return (
    <div className="max-w-lg space-y-5">
      <Breadcrumb items={[
        { label: t('nav.shops'), to: '/shops' },
        { label: shop?.name ?? t('shops.shop'), to: `/shops/${shopId}` },
        { label: t('nav.products'), to: `/shops/${shopId}` },
        { label: product.name ?? t('products.editTitle') },
      ]} />
      <h1 className="text-2xl font-semibold text-white">{t('products.editTitle')}</h1>

      {isUpdateError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">{t('products.failedToUpdate')}</p>
        </GlassCard>
      )}

      {isDeleteError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">{t('products.failedToDelete')}</p>
        </GlassCard>
      )}

      {categoryError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">{t('products.categoryRequired')}</p>
        </GlassCard>
      )}

      {scheduleError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">{t('products.scheduleInvalid')}</p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label={t('products.name')}
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <GlassTextarea
            label={t('products.description')}
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <CurrencyInput
            label={t('products.price', { symbol: currencySymbol })}
            valueCents={form.price}
            onChange={(cents) => setForm((f) => ({ ...f, price: cents }))}
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

          {/* Variant Groups */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">{t('variants.title')}</span>
              <GlassButton type="button" variant="secondary" size="sm" onClick={addVariantGroup}>
                {t('variants.addGroup')}
              </GlassButton>
            </div>
            {variantGroups.map(group => (
              <div key={group.id} className="border border-white/15 rounded-xl p-3 space-y-3">
                <GlassInput
                  placeholder={t('variants.groupNamePlaceholder')}
                  value={group.name}
                  onChange={(e) => updateVariantGroupName(group.id, e.target.value)}
                />
                <div className="space-y-2">
                  {group.options.map(option => (
                    <div key={option.id} className="flex items-center gap-2">
                      <GlassInput
                        placeholder={t('variants.optionNamePlaceholder')}
                        value={option.name}
                        onChange={(e) => updateVariantOption(group.id, option.id, { name: e.target.value })}
                        className="flex-1"
                      />
                      <CurrencyInput
                        valueCents={option.priceDelta}
                        onChange={(cents) => updateVariantOption(group.id, option.id, { priceDelta: cents })}
                        className="w-24"
                      />
                      <label className="flex items-center gap-1 text-xs text-white/60 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={option.isAvailable}
                          onChange={(e) => updateVariantOption(group.id, option.id, { isAvailable: e.target.checked })}
                          className="accent-white/80"
                        />
                        {t('variants.available')}
                      </label>
                      <GlassButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariantOption(group.id, option.id)}
                      >
                        ×
                      </GlassButton>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => addVariantOption(group.id)}
                    className="text-xs text-white/60 hover:text-white/90 transition-colors"
                  >
                    {t('variants.addOption')}
                  </button>
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariantGroup(group.id)}
                    className="text-red-400/80 hover:text-red-400"
                  >
                    {t('variants.removeGroup')}
                  </GlassButton>
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Addon Groups */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">{t('addons.title')}</span>
              <GlassButton type="button" variant="secondary" size="sm" onClick={addAddonGroup}>
                {t('addons.addGroup')}
              </GlassButton>
            </div>
            {addonGroups.map(group => (
              <div key={group.id} className="border border-white/15 rounded-xl p-3 space-y-3">
                <GlassInput
                  placeholder={t('addons.groupNamePlaceholder')}
                  value={group.name}
                  onChange={(e) => updateAddonGroup(group.id, { name: e.target.value })}
                />
                <div className="flex gap-3">
                  <GlassInput
                    label={t('addons.min')}
                    type="number"
                    min="0"
                    value={group.minSelectable}
                    onChange={(e) => updateAddonGroup(group.id, { minSelectable: parseInt(e.target.value || '0', 10) })}
                    className="flex-1"
                  />
                  <GlassInput
                    label={t('addons.max')}
                    type="number"
                    min="0"
                    value={group.maxSelectable}
                    onChange={(e) => updateAddonGroup(group.id, { maxSelectable: parseInt(e.target.value || '0', 10) })}
                    className="flex-1"
                  />
                </div>
                <div className="space-y-2">
                  {group.options.map(option => (
                    <div key={option.id} className="flex items-center gap-2">
                      <GlassInput
                        placeholder={t('addons.optionNamePlaceholder')}
                        value={option.name}
                        onChange={(e) => updateAddonOption(group.id, option.id, { name: e.target.value })}
                        className="flex-1"
                      />
                      <CurrencyInput
                        valueCents={option.priceDelta}
                        onChange={(cents) => updateAddonOption(group.id, option.id, { priceDelta: cents })}
                        className="w-24"
                      />
                      <label className="flex items-center gap-1 text-xs text-white/60 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={option.isAvailable}
                          onChange={(e) => updateAddonOption(group.id, option.id, { isAvailable: e.target.checked })}
                          className="accent-white/80"
                        />
                        {t('addons.available')}
                      </label>
                      <GlassButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAddonOption(group.id, option.id)}
                      >
                        ×
                      </GlassButton>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => addAddonOption(group.id)}
                    className="text-xs text-white/60 hover:text-white/90 transition-colors"
                  >
                    {t('addons.addOption')}
                  </button>
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddonGroup(group.id)}
                    className="text-red-400/80 hover:text-red-400"
                  >
                    {t('addons.removeGroup')}
                  </GlassButton>
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Schedule */}
          <GlassCard className="p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="accent-white/80"
              />
              <span className="text-sm font-medium text-white/70">{t('products.scheduleTitle')}</span>
            </label>
            <p className="text-xs text-white/40">{t('products.scheduleToggle')}</p>
            {scheduleEnabled && (
              <div className="space-y-3 pt-1">
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-white/50 uppercase tracking-wide">{t('products.scheduleStartDate')}</label>
                    <input
                      type="date"
                      required
                      value={schedule.startDate}
                      onChange={(e) => setSchedule((s) => ({ ...s, startDate: e.target.value }))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/45"
                    />
                  </div>
                  {!noEndDate && (
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-white/50 uppercase tracking-wide">{t('products.scheduleEndDate')}</label>
                      <input
                        type="date"
                        value={schedule.endDate}
                        onChange={(e) => setSchedule((s) => ({ ...s, endDate: e.target.value }))}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/45"
                      />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noEndDate}
                    onChange={(e) => setNoEndDate(e.target.checked)}
                    className="accent-white/80"
                  />
                  {t('products.scheduleNoEndDate')}
                </label>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-white/50 uppercase tracking-wide">{t('products.scheduleStartTime')}</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => setSchedule((s) => ({ ...s, startTime: e.target.value }))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/45"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-white/50 uppercase tracking-wide">{t('products.scheduleEndTime')}</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => setSchedule((s) => ({ ...s, endTime: e.target.value }))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/45"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50 uppercase tracking-wide">{t('products.scheduleDaysOfWeek')}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {([1,2,3,4,5,6,0] as number[]).map((day) => {
                      const keys = ['scheduleSun','scheduleMon','scheduleTue','scheduleWed','scheduleThu','scheduleFri','scheduleSat'];
                      const label = t(`products.${keys[day]}`);
                      const selected = schedule.daysOfWeek.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSchedule((s) => ({
                            ...s,
                            daysOfWeek: selected
                              ? s.daysOfWeek.filter((d) => d !== day)
                              : [...s.daysOfWeek, day],
                          }))}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            selected
                              ? 'bg-white/20 border-white/40 text-white'
                              : 'bg-transparent border-white/15 text-white/40 hover:border-white/30 hover:text-white/60'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
              {t('products.image')}
            </p>
            {(() => {
              const currentUrl = product.images?.find((img) => img.isPrimary)?.url ?? product.images?.[0]?.url;
              return (currentUrl || previewUrl) ? (
                <div className="flex items-start gap-4">
                  {currentUrl && (
                    <div className="flex flex-col gap-1 items-center">
                      <div className="relative">
                        <img src={currentUrl} alt={t('products.currentImage')} className={`w-24 h-24 rounded-xl object-cover ${previewUrl ? 'opacity-50' : ''}`} />
                        {previewUrl && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                            <X className="w-8 h-8 text-white/80" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/35">{t('products.currentImage')}</span>
                    </div>
                  )}
                  {previewUrl && (
                    <div className="flex flex-col gap-1 items-center">
                      <img src={previewUrl} alt={t('products.newImage')} className="w-24 h-24 rounded-xl object-cover" />
                      <span className="text-xs text-white/35">{t('products.newImage')}</span>
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
              {t('products.cancel')}
            </GlassButton>
            <GlassButton type="submit" disabled={isUpdating || isUploading} className="flex-1">
              {isUpdating ? t('products.saving') : isUploading ? t('products.uploadingImage') : t('products.saveChanges')}
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-white">{t('products.dangerZone')}</p>
          <p className="text-xs text-white/50">{t('products.deleteWarning')}</p>
          {confirmingDelete ? (
            <div className="space-y-3">
              <GlassInput
                label={t('products.deleteTypeToConfirm', { name: product.name })}
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={product.name}
              />
              <div className="flex gap-2">
                <GlassButton variant="danger" disabled={isDeleting || deleteConfirmName !== product.name} onClick={handleDelete}>
                  {isDeleting ? t('products.deleting') : t('products.confirmDelete')}
                </GlassButton>
                <GlassButton variant="ghost" disabled={isDeleting} onClick={() => { setConfirmingDelete(false); setDeleteConfirmName(''); }}>
                  {t('products.cancel')}
                </GlassButton>
              </div>
            </div>
          ) : (
            <GlassButton variant="danger" onClick={() => setConfirmingDelete(true)}>
              {t('products.delete')}
            </GlassButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
