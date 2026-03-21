import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ProductResponse, ProductSchedule } from '../services/api';
import {
  useGetProductsByShopQuery,
  useGetProductByIdQuery,
  useGetCategoriesByShopQuery,
  useGetShopByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGenerateUploadUrlMutation,
  useAddProductImageMutation,
} from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { getCurrencySymbol } from '../utils/currency';
import { Calendar, Pencil, Trash2, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import {
  type VariantGroup, type VariantOption, type AddonGroup, type AddonOption,
  type StepNum, type ScheduleState, type SpecialInfoItem,
  StepIndicator, Step1Basics, Step2Categories, Step3Customise, Step4Schedule, Step5Review,
} from './ProductWizardSteps';
import { LucideIconByName } from '../components/ui/IconPicker';

// ── Product detail view (read-only) ───────────────────────────────────────────

function ProductDetailView({
  product,
  currencySymbol,
  onEdit,
  onClose,
}: {
  product: ProductResponse;
  currencySymbol: string;
  onEdit: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const imageUrl = product.images?.length ? product.images[product.images.length - 1].url : undefined;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{t('products.detailTitle')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('products.detailSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={13} />
            {t('products.edit')}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Image + name/price row */}
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-300 font-bold text-3xl">
                  {product.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5">
              <p className="text-base font-semibold text-gray-900 leading-tight">{product.name}</p>
              {product.schedule && <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
            </div>
            <p className="text-sm font-medium text-gray-700">
              {currencySymbol}{((product.price ?? 0) / 100).toFixed(2)}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
                product.isAvailable !== false
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${product.isAvailable !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              {product.isAvailable !== false ? t('products.available') : t('products.unavailable')}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {t('products.detailDescription')}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description || <span className="text-gray-300 italic">{t('products.noDescription')}</span>}
          </p>
        </div>

        {/* Categories */}
        {(product.categories?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('products.detailCategories')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.categories!.map((c) => (
                <span
                  key={c.id}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Special Info */}
        {(product.specialInfo?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Special Info
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.specialInfo!.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700"
                >
                  <LucideIconByName name={item.icon} size={12} />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Variant groups */}
        {(product.variantGroups?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('variants.title')}
            </p>
            <div className="space-y-3">
              {product.variantGroups!.map((group, gi) => (
                <div key={group.id ?? gi} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">{group.name}</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(group.options ?? []).map((opt, oi) => (
                      <div key={opt.id ?? oi} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt.isAvailable !== false ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                          <span className="text-sm text-gray-700">{opt.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {`+${currencySymbol}${((opt.priceDelta ?? 0) / 100).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Addon groups */}
        {(product.addonGroups?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('addons.title')}
            </p>
            <div className="space-y-3">
              {product.addonGroups!.map((group, gi) => (
                <div key={group.id ?? gi} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">{group.name}</p>
                    <span className="text-xs text-gray-400">
                      {t('addons.min')} {group.minSelectable ?? 0} · {t('addons.max')} {group.maxSelectable ?? 1}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(group.options ?? []).map((opt, oi) => (
                      <div key={opt.id ?? oi} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt.isAvailable !== false ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                          <span className="text-sm text-gray-700">{opt.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {`+${currencySymbol}${((opt.priceDelta ?? 0) / 100).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Edit wizard view (inside the same modal) ──────────────────────────────────

function ProductEditView({
  productId,
  shopId,
  currencySymbol,
  categoriesList,
  taxRatesList,
  hasTaxRates,
  onSaved,
  onDeleted,
  onBack,
}: {
  productId: string;
  shopId: string;
  currencySymbol: string;
  categoriesList: { id: string; name: string }[];
  taxRatesList: { id: string; label: string }[];
  hasTaxRates: boolean;
  onSaved: () => void;
  onDeleted: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();

  const { data: product, isLoading: productLoading } = useGetProductByIdQuery(
    { productId, shopId },
    { refetchOnMountOrArgChange: true },
  );
  const [updateProduct, { isLoading: isUpdating, isError: isUpdateError }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [addProductImage] = useAddProductImageMutation();

  const [step, setStep] = useState<StepNum>(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({ name: '', description: '', price: 0 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string | null>(null);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleState>({
    startDate: '', endDate: '', startTime: '', endTime: '', daysOfWeek: [],
  });
  const [specialInfo, setSpecialInfo] = useState<SpecialInfoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [descError, setDescError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [taxRateError, setTaxRateError] = useState(false);
  const [scheduleError, setScheduleError] = useState(false);

  useEffect(() => {
    if (product && !initialized) {
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price ?? 0,
      });
      setSelectedCategoryIds(product.categories?.map((c) => c.id!).filter(Boolean) ?? []);
      setSelectedTaxRateId(product.taxRateId ?? null);
      setVariantGroups(
        (product.variantGroups ?? []).map((g) => ({
          id: g.id ?? crypto.randomUUID(),
          name: g.name ?? '',
          options: (g.options ?? []).map((o) => ({
            id: o.id ?? crypto.randomUUID(),
            name: o.name ?? '',
            priceDelta: o.priceDelta ?? 0,
            isAvailable: o.isAvailable ?? true,
          })),
        })),
      );
      setAddonGroups(
        (product.addonGroups ?? []).map((g) => ({
          id: g.id ?? crypto.randomUUID(),
          name: g.name ?? '',
          minSelectable: g.minSelectable ?? 0,
          maxSelectable: g.maxSelectable ?? 1,
          options: (g.options ?? []).map((o) => ({
            id: o.id ?? crypto.randomUUID(),
            name: o.name ?? '',
            priceDelta: o.priceDelta ?? 0,
            isAvailable: o.isAvailable ?? true,
          })),
        })),
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
      setSpecialInfo(
        (product.specialInfo ?? []).map((si) => ({ icon: si.icon, name: si.name })),
      );
      setInitialized(true);
    }
  }, [product, initialized]);

  // Variant helpers
  const addVariantGroup = () => setVariantGroups((gs) => [...gs, { id: crypto.randomUUID(), name: '', options: [] }]);
  const removeVariantGroup = (id: string) => setVariantGroups((gs) => gs.filter((g) => g.id !== id));
  const updateVariantGroupName = (id: string, name: string) => setVariantGroups((gs) => gs.map((g) => g.id === id ? { ...g, name } : g));
  const addVariantOption = (groupId: string) => setVariantGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: [...g.options, { id: crypto.randomUUID(), name: '', priceDelta: 0, isAvailable: true }] } : g));
  const removeVariantOption = (groupId: string, optionId: string) => setVariantGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g));
  const updateVariantOption = (groupId: string, optionId: string, patch: Partial<VariantOption>) => setVariantGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.map((o) => o.id === optionId ? { ...o, ...patch } : o) } : g));

  // Addon helpers
  const addAddonGroup = () => setAddonGroups((gs) => [...gs, { id: crypto.randomUUID(), name: '', minSelectable: 0, maxSelectable: 1, options: [] }]);
  const removeAddonGroup = (id: string) => setAddonGroups((gs) => gs.filter((g) => g.id !== id));
  const updateAddonGroup = (id: string, patch: Partial<AddonGroup>) => setAddonGroups((gs) => gs.map((g) => g.id === id ? { ...g, ...patch } : g));
  const addAddonOption = (groupId: string) => setAddonGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: [...g.options, { id: crypto.randomUUID(), name: '', priceDelta: 0, isAvailable: true }] } : g));
  const removeAddonOption = (groupId: string, optionId: string) => setAddonGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g));
  const updateAddonOption = (groupId: string, optionId: string, patch: Partial<AddonOption>) => setAddonGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.map((o) => o.id === optionId ? { ...o, ...patch } : o) } : g));

  function validateStep(s: StepNum): boolean {
    if (s === 1) {
      const ne = form.name.trim() === '';
      const de = form.description.trim() === '';
      setNameError(ne); setDescError(de);
      return !ne && !de;
    }
    if (s === 2) {
      const hasNoCategory = selectedCategoryIds.length === 0;
      const hasNoTax = hasTaxRates && selectedTaxRateId === null;
      setCategoryError(hasNoCategory); setTaxRateError(hasNoTax);
      return !hasNoCategory && !hasNoTax;
    }
    if (s === 4 && scheduleEnabled) {
      const endDateInvalid = !noEndDate && schedule.endDate && schedule.endDate < schedule.startDate;
      const endTimeInvalid = schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime;
      const invalid = !!(endDateInvalid || endTimeInvalid);
      setScheduleError(invalid);
      return !invalid;
    }
    return true;
  }

  function goNext() { if (!validateStep(step)) return; setDirection('forward'); setStep((s) => (s + 1) as StepNum); }
  function goBack() { setDirection('back'); setStep((s) => (s - 1) as StepNum); }
  function jumpTo(n: StepNum) { setDirection(n < step ? 'back' : 'forward'); setStep(n); }

  const handleSubmit = async () => {
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
        productId,
        updateProductRequest: {
          shopId,
          name: form.name,
          description: form.description,
          price: form.price,
          categoryIds: selectedCategoryIds,
          variantGroups,
          addonGroups,
          taxRateId: selectedTaxRateId,
          schedule: schedulePayload,
          specialInfo: specialInfo.length > 0 ? specialInfo : undefined,
        },
      }).unwrap();

      if (imageFile) {
        setIsUploading(true);
        const contentType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp';
        const uploadData = await generateUploadUrl({
          shopId,
          productId,
          generateImageUploadUrlRequest: { contentType, fileName: imageFile.name },
        }).unwrap();
        await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': contentType },
          body: imageFile,
        });
        await addProductImage({
          shopId,
          productId,
          addProductImageRequest: { imageId: uploadData.imageId, url: uploadData.blobUrl },
        }).unwrap();
        setIsUploading(false);
      }

      toast.success(t('products.saved'));
      onSaved();
    } catch {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct({ productId, shopId }).unwrap();
      toast.success(t('products.deleted'));
      onDeleted();
    } catch {
      toast.error(t('products.failedToDelete'));
    }
  };

  const existingImageUrl = product?.images?.find((img) => img.isPrimary)?.url ?? product?.images?.[0]?.url ?? null;
  const isBusy = isUpdating || isUploading;
  const submitLabel = isUpdating ? t('products.saving') : isUploading ? t('products.uploadingImage') : t('products.saveChanges');
  const stepSubtitles: Record<StepNum, string> = {
    1: t('products.wizardStep1Subtitle'),
    2: t('products.wizardStep2Subtitle'),
    3: t('products.wizardStep3Subtitle'),
    4: t('products.wizardStep4Subtitle'),
    5: t('products.wizardStep5Subtitle'),
  };

  if (productLoading || !initialized) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <GlassSpinner label={t('products.loadingProduct')} />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-200 flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{t('products.editTitle')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{stepSubtitles[step]}</p>
        </div>
        <div className="flex items-center gap-2">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
              {t('products.delete')}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                {isDeleting ? '…' : t('products.confirmDelete')}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t('products.cancel')}
              </button>
            </div>
          )}
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Back to details"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-6 pt-4 flex-shrink-0">
        <StepIndicator currentStep={step} onJump={jumpTo} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isUpdateError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{t('products.failedToUpdate')}</p>
          </div>
        )}
        <div key={step} className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}>
          {step === 1 && (
            <Step1Basics form={form} setForm={setForm} imageFile={imageFile} setImageFile={setImageFile} currencySymbol={currencySymbol} nameError={nameError} descError={descError} existingImageUrl={existingImageUrl} specialInfo={specialInfo} setSpecialInfo={setSpecialInfo} />
          )}
          {step === 2 && (
            <Step2Categories categories={categoriesList} selectedCategoryIds={selectedCategoryIds} setSelectedCategoryIds={setSelectedCategoryIds} taxRates={taxRatesList} selectedTaxRateId={selectedTaxRateId} setSelectedTaxRateId={setSelectedTaxRateId} categoryError={categoryError} taxRateError={taxRateError} />
          )}
          {step === 3 && (
            <Step3Customise variantGroups={variantGroups} addVariantGroup={addVariantGroup} removeVariantGroup={removeVariantGroup} updateVariantGroupName={updateVariantGroupName} addVariantOption={addVariantOption} removeVariantOption={removeVariantOption} updateVariantOption={updateVariantOption} addonGroups={addonGroups} addAddonGroup={addAddonGroup} removeAddonGroup={removeAddonGroup} updateAddonGroup={updateAddonGroup} addAddonOption={addAddonOption} removeAddonOption={removeAddonOption} updateAddonOption={updateAddonOption} />
          )}
          {step === 4 && (
            <Step4Schedule scheduleEnabled={scheduleEnabled} setScheduleEnabled={setScheduleEnabled} noEndDate={noEndDate} setNoEndDate={setNoEndDate} schedule={schedule} setSchedule={setSchedule} scheduleError={scheduleError} />
          )}
          {step === 5 && (
            <Step5Review form={form} imageFile={imageFile} existingImageUrl={existingImageUrl} selectedCategoryIds={selectedCategoryIds} categories={categoriesList} taxRates={taxRatesList} selectedTaxRateId={selectedTaxRateId} variantGroups={variantGroups} addonGroups={addonGroups} scheduleEnabled={scheduleEnabled} noEndDate={noEndDate} schedule={schedule} currencySymbol={currencySymbol} specialInfo={specialInfo} />
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-200 flex-shrink-0">
        {step === 1 && (
          <>
            <GlassButton type="button" variant="secondary" onClick={onBack}>← {t('products.cancel')}</GlassButton>
            <div className="flex-1" />
            <GlassButton type="button" onClick={goNext}>{t('products.wizardNext')} →</GlassButton>
          </>
        )}
        {step === 2 && (
          <>
            <GlassButton type="button" variant="secondary" onClick={goBack}>← {t('products.wizardBack')}</GlassButton>
            <div className="flex-1" />
            <GlassButton type="button" onClick={goNext}>{t('products.wizardNext')} →</GlassButton>
          </>
        )}
        {(step === 3 || step === 4) && (
          <>
            <GlassButton type="button" variant="secondary" onClick={goBack}>← {t('products.wizardBack')}</GlassButton>
            <div className="flex-1" />
            <GlassButton type="button" variant="ghost" onClick={goNext}>{t('products.wizardSkip')}</GlassButton>
            <GlassButton type="button" onClick={goNext}>{t('products.wizardNext')} →</GlassButton>
          </>
        )}
        {step === 5 && (
          <>
            <GlassButton type="button" variant="secondary" onClick={goBack}>← {t('products.wizardBack')}</GlassButton>
            <div className="flex-1" />
            <GlassButton type="button" disabled={isBusy} onClick={handleSubmit}>{submitLabel}</GlassButton>
          </>
        )}
      </div>
    </>
  );
}

// ── Combined product modal (view → edit) ──────────────────────────────────────

function ProductModal({
  productId,
  shopId,
  onClose,
  onDeleted,
}: {
  productId: string;
  shopId: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { data: shop } = useGetShopByIdQuery({ shopId });
  const { data: categories } = useGetCategoriesByShopQuery({ shopId });
  const { data: fullProduct, isLoading: productLoading } = useGetProductByIdQuery(
    { productId, shopId },
    { refetchOnMountOrArgChange: true },
  );

  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const currencySymbol = shop?.currency ? getCurrencySymbol(shop.currency) : '$';
  const taxRates = shop?.taxRates ?? [];
  const hasTaxRates = taxRates.length > 0;
  const categoriesList = (categories ?? []).filter((c): c is { id: string; name: string } => !!c.id && !!c.name);
  const taxRatesList = taxRates.filter((r): r is { id: string; label: string } => !!r.id && !!r.label);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {productLoading || !fullProduct ? (
            <div className="flex-1 flex items-center justify-center p-10">
              <GlassSpinner label={t('products.loadingProduct')} />
            </div>
          ) : mode === 'view' ? (
            <ProductDetailView
              product={fullProduct}
              currencySymbol={currencySymbol}
              onEdit={() => setMode('edit')}
              onClose={onClose}
            />
          ) : (
            <ProductEditView
              productId={productId}
              shopId={shopId}
              currencySymbol={currencySymbol}
              categoriesList={categoriesList}
              taxRatesList={taxRatesList}
              hasTaxRates={hasTaxRates}
              onSaved={onClose}
              onDeleted={onDeleted}
              onBack={() => setMode('view')}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ── Add Product Modal (5-step wizard) ─────────────────────────────────────────

interface AddProductModalProps {
  shopId: string;
  onClose: () => void;
}

function AddProductModal({ shopId, onClose }: AddProductModalProps) {
  const { t } = useTranslation();
  const toast = useToast();

  const { data: shop } = useGetShopByIdQuery({ shopId });
  const currencySymbol = shop?.currency ? getCurrencySymbol(shop.currency) : '$';
  const { data: categories } = useGetCategoriesByShopQuery({ shopId });
  const [createProduct, { isLoading, isError, error }] = useCreateProductMutation();
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [addProductImage] = useAddProductImageMutation();

  const taxRates = shop?.taxRates ?? [];
  const hasTaxRates = taxRates.length > 0;
  const categoriesList = (categories ?? []).filter((c): c is { id: string; name: string } => !!c.id && !!c.name);
  const taxRatesList = taxRates.filter((r): r is { id: string; label: string } => !!r.id && !!r.label);

  const [step, setStep] = useState<StepNum>(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const [form, setForm] = useState({ name: '', description: '', price: 0 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string | null>(null);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleState>({ startDate: '', endDate: '', startTime: '', endTime: '', daysOfWeek: [] });
  const [specialInfo, setSpecialInfo] = useState<SpecialInfoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [descError, setDescError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [taxRateError, setTaxRateError] = useState(false);
  const [scheduleError, setScheduleError] = useState(false);

  // Variant helpers
  const addVariantGroup = () => setVariantGroups((gs) => [...gs, { id: crypto.randomUUID(), name: '', options: [] }]);
  const removeVariantGroup = (id: string) => setVariantGroups((gs) => gs.filter((g) => g.id !== id));
  const updateVariantGroupName = (id: string, name: string) => setVariantGroups((gs) => gs.map((g) => g.id === id ? { ...g, name } : g));
  const addVariantOption = (groupId: string) => setVariantGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: [...g.options, { id: crypto.randomUUID(), name: '', priceDelta: 0, isAvailable: true }] } : g));
  const removeVariantOption = (groupId: string, optionId: string) => setVariantGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g));
  const updateVariantOption = (groupId: string, optionId: string, patch: Partial<VariantOption>) => setVariantGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.map((o) => o.id === optionId ? { ...o, ...patch } : o) } : g));

  // Addon helpers
  const addAddonGroup = () => setAddonGroups((gs) => [...gs, { id: crypto.randomUUID(), name: '', minSelectable: 0, maxSelectable: 1, options: [] }]);
  const removeAddonGroup = (id: string) => setAddonGroups((gs) => gs.filter((g) => g.id !== id));
  const updateAddonGroup = (id: string, patch: Partial<AddonGroup>) => setAddonGroups((gs) => gs.map((g) => g.id === id ? { ...g, ...patch } : g));
  const addAddonOption = (groupId: string) => setAddonGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: [...g.options, { id: crypto.randomUUID(), name: '', priceDelta: 0, isAvailable: true }] } : g));
  const removeAddonOption = (groupId: string, optionId: string) => setAddonGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g));
  const updateAddonOption = (groupId: string, optionId: string, patch: Partial<AddonOption>) => setAddonGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, options: g.options.map((o) => o.id === optionId ? { ...o, ...patch } : o) } : g));

  function validateStep(s: StepNum): boolean {
    if (s === 1) {
      const ne = form.name.trim() === '';
      const de = form.description.trim() === '';
      setNameError(ne); setDescError(de);
      return !ne && !de;
    }
    if (s === 2) {
      const hasNoCategory = selectedCategoryIds.length === 0;
      const hasNoTax = hasTaxRates && selectedTaxRateId === null;
      setCategoryError(hasNoCategory); setTaxRateError(hasNoTax);
      return !hasNoCategory && !hasNoTax;
    }
    if (s === 4 && scheduleEnabled) {
      const endDateInvalid = !noEndDate && schedule.endDate && schedule.endDate < schedule.startDate;
      const endTimeInvalid = schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime;
      const invalid = !!(endDateInvalid || endTimeInvalid);
      setScheduleError(invalid);
      return !invalid;
    }
    return true;
  }

  function goNext() { if (!validateStep(step)) return; setDirection('forward'); setStep((s) => (s + 1) as StepNum); }
  function goBack() { setDirection('back'); setStep((s) => (s - 1) as StepNum); }
  function jumpTo(n: StepNum) { setDirection(n < step ? 'back' : 'forward'); setStep(n); }

  const handleSubmit = async () => {
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
      const product = await createProduct({
        createProductRequest: {
          shopId,
          name: form.name,
          description: form.description,
          price: form.price,
          categoryIds: selectedCategoryIds,
          taxRateId: selectedTaxRateId,
          variantGroups: variantGroups.length > 0 ? variantGroups : undefined,
          addonGroups: addonGroups.length > 0 ? addonGroups : undefined,
          schedule: schedulePayload,
          specialInfo: specialInfo.length > 0 ? specialInfo : undefined,
        },
      }).unwrap();

      if (imageFile) {
        setIsUploading(true);
        const contentType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp';
        const uploadData = await generateUploadUrl({
          shopId,
          productId: product.id!,
          generateImageUploadUrlRequest: { contentType, fileName: imageFile.name },
        }).unwrap();
        await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': contentType },
          body: imageFile,
        });
        await addProductImage({
          shopId,
          productId: product.id!,
          addProductImageRequest: { imageId: uploadData.imageId, url: uploadData.blobUrl },
        }).unwrap();
      }

      toast.success(t('products.created'));
      onClose();
    } catch {
      setIsUploading(false);
    }
  };

  const isBusy = isLoading || isUploading;
  const submitLabel = isLoading ? t('products.creating') : isUploading ? t('products.uploadingImage') : t('products.create');
  const stepSubtitles: Record<StepNum, string> = {
    1: t('products.wizardStep1Subtitle'),
    2: t('products.wizardStep2Subtitle'),
    3: t('products.wizardStep3Subtitle'),
    4: t('products.wizardStep4Subtitle'),
    5: t('products.wizardStep5Subtitle'),
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{t('products.newProduct')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{stepSubtitles[step]}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="px-6 pt-4 flex-shrink-0">
            <StepIndicator currentStep={step} onJump={jumpTo} />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">
                  {(error as { data?: { error?: string } })?.data?.error ?? t('products.failedToCreate')}
                </p>
              </div>
            )}
            <div key={step} className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}>
              {step === 1 && <Step1Basics form={form} setForm={setForm} imageFile={imageFile} setImageFile={setImageFile} currencySymbol={currencySymbol} nameError={nameError} descError={descError} specialInfo={specialInfo} setSpecialInfo={setSpecialInfo} />}
              {step === 2 && <Step2Categories categories={categoriesList} selectedCategoryIds={selectedCategoryIds} setSelectedCategoryIds={setSelectedCategoryIds} taxRates={taxRatesList} selectedTaxRateId={selectedTaxRateId} setSelectedTaxRateId={setSelectedTaxRateId} categoryError={categoryError} taxRateError={taxRateError} />}
              {step === 3 && <Step3Customise variantGroups={variantGroups} addVariantGroup={addVariantGroup} removeVariantGroup={removeVariantGroup} updateVariantGroupName={updateVariantGroupName} addVariantOption={addVariantOption} removeVariantOption={removeVariantOption} updateVariantOption={updateVariantOption} addonGroups={addonGroups} addAddonGroup={addAddonGroup} removeAddonGroup={removeAddonGroup} updateAddonGroup={updateAddonGroup} addAddonOption={addAddonOption} removeAddonOption={removeAddonOption} updateAddonOption={updateAddonOption} />}
              {step === 4 && <Step4Schedule scheduleEnabled={scheduleEnabled} setScheduleEnabled={setScheduleEnabled} noEndDate={noEndDate} setNoEndDate={setNoEndDate} schedule={schedule} setSchedule={setSchedule} scheduleError={scheduleError} />}
              {step === 5 && <Step5Review form={form} imageFile={imageFile} selectedCategoryIds={selectedCategoryIds} categories={categoriesList} taxRates={taxRatesList} selectedTaxRateId={selectedTaxRateId} variantGroups={variantGroups} addonGroups={addonGroups} scheduleEnabled={scheduleEnabled} noEndDate={noEndDate} schedule={schedule} currencySymbol={currencySymbol} specialInfo={specialInfo} />}
            </div>
          </div>

          {/* Footer navigation */}
          <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-200 flex-shrink-0">
            {step === 1 && (
              <>
                <GlassButton type="button" variant="secondary" onClick={onClose}>{t('products.cancel')}</GlassButton>
                <div className="flex-1" />
                <GlassButton type="button" onClick={goNext}>{t('products.wizardNext')} →</GlassButton>
              </>
            )}
            {step === 2 && (
              <>
                <GlassButton type="button" variant="secondary" onClick={goBack}>← {t('products.wizardBack')}</GlassButton>
                <div className="flex-1" />
                <GlassButton type="button" onClick={goNext}>{t('products.wizardNext')} →</GlassButton>
              </>
            )}
            {(step === 3 || step === 4) && (
              <>
                <GlassButton type="button" variant="secondary" onClick={goBack}>← {t('products.wizardBack')}</GlassButton>
                <div className="flex-1" />
                <GlassButton type="button" variant="ghost" onClick={goNext}>{t('products.wizardSkip')}</GlassButton>
                <GlassButton type="button" onClick={goNext}>{t('products.wizardNext')} →</GlassButton>
              </>
            )}
            {step === 5 && (
              <>
                <GlassButton type="button" variant="secondary" onClick={goBack}>← {t('products.wizardBack')}</GlassButton>
                <div className="flex-1" />
                <GlassButton type="button" disabled={isBusy} onClick={handleSubmit}>{submitLabel}</GlassButton>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Products table ─────────────────────────────────────────────────────────────

function ProductTable({
  products,
  onSelect,
}: {
  products: ProductResponse[];
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="divide-y divide-gray-200">
      {products.map((product) => {
        const imageUrl = product.images?.length
          ? product.images[product.images.length - 1].url
          : undefined;

        return (
          <div
            key={product.id}
            onClick={() => onSelect(product.id!)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer group transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-300 font-semibold text-sm">
                    {product.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
                {product.schedule && <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
              </div>
            </div>

            {/* Price */}
            <span className="text-sm text-gray-500 flex-shrink-0 w-20 text-right">
              ${((product.price ?? 0) / 100).toFixed(2)}
            </span>

            {/* Availability badge */}
            <div className="flex-shrink-0 w-28 flex justify-center">
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                  product.isAvailable !== false
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${product.isAvailable !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                {product.isAvailable !== false ? t('products.available') : t('products.unavailable')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function ProductsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products, isLoading, isError } = useGetProductsByShopQuery({ shopId: shopId! });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const showAddModal = searchParams.get('addProduct') === '1';
  const closeAddModal = () => setSearchParams((p) => { const n = new URLSearchParams(p); n.delete('addProduct'); return n; });

  if (isLoading) return <GlassSpinner label={t('products.loading')} />;
  if (isError) return <p className="text-red-500">{t('products.loadError')}</p>;

  // Group by category
  const categoryMap = new Map<string, { id: string; name: string; sortOrder: number }>();
  for (const product of products ?? []) {
    for (const cat of product.categories ?? []) {
      if (cat.id && !categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, { id: cat.id, name: cat.name ?? '', sortOrder: cat.sortOrder ?? 0 });
      }
    }
  }
  const sortedCategories = [...categoryMap.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );

  const byCategory = new Map<string, ProductResponse[]>();
  for (const cat of sortedCategories) {
    byCategory.set(
      cat.id,
      (products ?? []).filter((p) => p.categories?.some((c) => c.id === cat.id)),
    );
  }

  const uncategorized = (products ?? []).filter((p) => !p.categories?.length);
  const isEmpty = !products?.length;

  return (
    <>
      <div className="space-y-6">
        {isEmpty && <p className="text-gray-400 text-sm">{t('products.empty')}</p>}

        {sortedCategories.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
              {cat.name}
            </h2>
            <GlassCard>
              <ProductTable
                products={byCategory.get(cat.id)!}
                onSelect={setSelectedProductId}
              />
            </GlassCard>
          </section>
        ))}

        {uncategorized.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
              {t('products.uncategorized')}
            </h2>
            <GlassCard>
              <ProductTable products={uncategorized} onSelect={setSelectedProductId} />
            </GlassCard>
          </section>
        )}
      </div>

      {selectedProductId && (
        <ProductModal
          productId={selectedProductId}
          shopId={shopId!}
          onClose={() => setSelectedProductId(null)}
          onDeleted={() => setSelectedProductId(null)}
        />
      )}

      {showAddModal && (
        <AddProductModal
          shopId={shopId!}
          onClose={closeAddModal}
        />
      )}
    </>
  );
}
