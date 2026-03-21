/**
 * Shared step components for the Create / Edit product wizards.
 */
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassTextarea } from '../components/ui/GlassInput';
import { CurrencyInput } from '../components/ui/CurrencyInput';

// ── Shared types ──────────────────────────────────────────────────────────────

export type VariantOption = { id: string; name: string; priceDelta: number; isAvailable: boolean };
export type VariantGroup  = { id: string; name: string; options: VariantOption[] };
export type AddonOption   = { id: string; name: string; priceDelta: number; isAvailable: boolean };
export type AddonGroup    = { id: string; name: string; minSelectable: number; maxSelectable: number; options: AddonOption[] };
export type StepNum = 1 | 2 | 3 | 4 | 5;

export interface ScheduleState {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

// ── Step Indicator ────────────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: StepNum;
  onJump: (n: StepNum) => void;
}

export function StepIndicator({ currentStep, onJump }: StepIndicatorProps) {
  const { t } = useTranslation();
  const labels = [
    t('products.wizardStep1'),
    t('products.wizardStep2'),
    t('products.wizardStep3'),
    t('products.wizardStep4'),
    t('products.wizardStep5'),
  ];

  return (
    <div className="flex items-center justify-between w-full">
      {labels.map((label, i) => {
        const n = (i + 1) as StepNum;
        const isCompleted = n < currentStep;
        const isActive = n === currentStep;

        const circleBase =
          'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors duration-200 shrink-0';
        const circleClass = isCompleted
          ? 'bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:bg-emerald-400'
          : isActive
          ? 'bg-gray-900 border-gray-900 text-white'
          : 'bg-transparent border-gray-200 text-gray-300';

        return (
          <div key={n} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <button
                type="button"
                className={`${circleBase} ${circleClass}`}
                onClick={() => isCompleted && onJump(n)}
                disabled={!isCompleted}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? '✓' : n}
              </button>
              <span
                className={`text-[10px] font-medium leading-tight text-center truncate max-w-[52px] transition-colors duration-200 ${
                  isCompleted ? 'text-emerald-500' : isActive ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                {label}
              </span>
            </div>
            {n < 5 && (
              <div
                className={`flex-1 h-px mx-1 mb-4 transition-colors duration-200 ${
                  n < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Basics ────────────────────────────────────────────────────────────

interface Step1Props {
  form: { name: string; description: string; price: number };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; description: string; price: number }>>;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  currencySymbol: string;
  nameError: boolean;
  descError: boolean;
  existingImageUrl?: string | null;
}

export function Step1Basics({ form, setForm, imageFile, setImageFile, currencySymbol, nameError, descError, existingImageUrl }: Step1Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div>
        <GlassInput
          label={t('products.name')}
          type="text"
          placeholder={t('products.namePlaceholder')}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        {nameError && (
          <p className="mt-1 text-xs text-red-500">{t('products.name')} is required.</p>
        )}
      </div>
      <div>
        <GlassTextarea
          label={t('products.description')}
          placeholder={t('products.descriptionPlaceholder')}
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        {descError && (
          <p className="mt-1 text-xs text-red-500">{t('products.description')} is required.</p>
        )}
      </div>
      <CurrencyInput
        label={t('products.price', { symbol: currencySymbol })}
        valueCents={form.price}
        onChange={(cents) => setForm((f) => ({ ...f, price: cents }))}
      />
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-gray-700">
          {t('products.image')}{' '}
          <span className="text-gray-300 font-normal">{t('products.imageOptionalNote')}</span>
        </p>
        {(existingImageUrl || imageFile) && (
          <div className="flex items-start gap-3">
            {existingImageUrl && (
              <div className="flex flex-col gap-1 items-center">
                <img
                  src={existingImageUrl}
                  alt={t('products.currentImage')}
                  className={`w-16 h-16 rounded-xl object-cover border border-gray-200 ${imageFile ? 'opacity-50' : ''}`}
                />
                <span className="text-xs text-gray-400">{t('products.currentImage')}</span>
              </div>
            )}
            {imageFile && (
              <div className="flex flex-col gap-1 items-center">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt={t('products.newImage')}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                />
                <span className="text-xs text-gray-400">{t('products.newImage')}</span>
              </div>
            )}
          </div>
        )}
        {!existingImageUrl && imageFile && (
          <div className="flex items-center gap-2">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            />
            <p className="text-xs text-gray-400">{imageFile.name}</p>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ── Step 2: Categories & Tax ──────────────────────────────────────────────────

interface Step2Props {
  categories: { id: string; name: string }[];
  selectedCategoryIds: string[];
  setSelectedCategoryIds: (ids: string[]) => void;
  taxRates: { id: string; label: string }[];
  selectedTaxRateId: string | null;
  setSelectedTaxRateId: (id: string | null) => void;
  categoryError: boolean;
  taxRateError: boolean;
}

export function Step2Categories({
  categories,
  selectedCategoryIds,
  setSelectedCategoryIds,
  taxRates,
  selectedTaxRateId,
  setSelectedTaxRateId,
  categoryError,
  taxRateError,
}: Step2Props) {
  const { t } = useTranslation();

  const remaining = categories.filter((c) => !selectedCategoryIds.includes(c.id));
  const selected  = categories.filter((c) => selectedCategoryIds.includes(c.id));

  const addCategory = (id: string) => {
    if (id) setSelectedCategoryIds([...selectedCategoryIds, id]);
  };
  const removeCategory = (id: string) =>
    setSelectedCategoryIds(selectedCategoryIds.filter((s) => s !== id));

  return (
    <div className="space-y-4">
      {categories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {t('products.categories')}
          </label>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs bg-gray-100 border border-gray-200 text-gray-700"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className="text-gray-400 hover:text-gray-700 transition-colors leading-none"
                    aria-label={`Remove ${cat.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {remaining.length > 0 && (
            <select
              value=""
              onChange={(e) => { addCategory(e.target.value); e.target.value = ''; }}
              className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
            >
              <option value="" className="text-gray-400">
                {selected.length === 0 ? 'Select a category…' : 'Add another category…'}
              </option>
              {remaining.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
          {categoryError && (
            <p className="text-xs text-red-500">{t('products.categoryRequired')}</p>
          )}
        </div>
      )}

      {taxRates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {t('products.taxRate')}
          </label>
          <select
            value={selectedTaxRateId ?? ''}
            onChange={(e) => setSelectedTaxRateId(e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
          >
            <option value="">
              {t('products.taxRateNone')}
            </option>
            {taxRates.map((rate) => (
              <option key={rate.id} value={rate.id}>
                {rate.label}
              </option>
            ))}
          </select>
          {taxRateError && (
            <p className="text-xs text-red-500">{t('products.taxRateRequired')}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Step 3: Customise (Variants + Addons) ─────────────────────────────────────

interface Step3Props {
  variantGroups: VariantGroup[];
  addVariantGroup: () => void;
  removeVariantGroup: (id: string) => void;
  updateVariantGroupName: (id: string, name: string) => void;
  addVariantOption: (groupId: string) => void;
  removeVariantOption: (groupId: string, optionId: string) => void;
  updateVariantOption: (groupId: string, optionId: string, patch: Partial<VariantOption>) => void;
  addonGroups: AddonGroup[];
  addAddonGroup: () => void;
  removeAddonGroup: (id: string) => void;
  updateAddonGroup: (id: string, patch: Partial<AddonGroup>) => void;
  addAddonOption: (groupId: string) => void;
  removeAddonOption: (groupId: string, optionId: string) => void;
  updateAddonOption: (groupId: string, optionId: string, patch: Partial<AddonOption>) => void;
}

export function Step3Customise({
  variantGroups, addVariantGroup, removeVariantGroup, updateVariantGroupName,
  addVariantOption, removeVariantOption, updateVariantOption,
  addonGroups, addAddonGroup, removeAddonGroup, updateAddonGroup,
  addAddonOption, removeAddonOption, updateAddonOption,
}: Step3Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {/* Variant Groups */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('variants.title')}</span>
          <GlassButton type="button" variant="secondary" size="sm" onClick={addVariantGroup}>
            {t('variants.addGroup')}
          </GlassButton>
        </div>
        {variantGroups.map(group => (
          <div key={group.id} className="border border-gray-200 rounded-xl p-3 space-y-3">
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
                  <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={option.isAvailable}
                      onChange={(e) => updateVariantOption(group.id, option.id, { isAvailable: e.target.checked })}
                      className="accent-gray-900"
                    />
                    {t('variants.available')}
                  </label>
                  <GlassButton type="button" variant="ghost" size="sm" onClick={() => removeVariantOption(group.id, option.id)}>
                    ×
                  </GlassButton>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => addVariantOption(group.id)}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                {t('variants.addOption')}
              </button>
              <GlassButton
                type="button" variant="ghost" size="sm"
                onClick={() => removeVariantGroup(group.id)}
                className="text-red-500 hover:text-red-600"
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
          <span className="text-sm font-medium text-gray-700">{t('addons.title')}</span>
          <GlassButton type="button" variant="secondary" size="sm" onClick={addAddonGroup}>
            {t('addons.addGroup')}
          </GlassButton>
        </div>
        {addonGroups.map(group => (
          <div key={group.id} className="border border-gray-200 rounded-xl p-3 space-y-3">
            <GlassInput
              placeholder={t('addons.groupNamePlaceholder')}
              value={group.name}
              onChange={(e) => updateAddonGroup(group.id, { name: e.target.value })}
            />
            <div className="flex gap-3">
              <GlassInput
                label={t('addons.min')} type="number" min="0"
                value={group.minSelectable}
                onChange={(e) => updateAddonGroup(group.id, { minSelectable: parseInt(e.target.value || '0', 10) })}
                className="flex-1"
              />
              <GlassInput
                label={t('addons.max')} type="number" min="0"
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
                  <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={option.isAvailable}
                      onChange={(e) => updateAddonOption(group.id, option.id, { isAvailable: e.target.checked })}
                      className="accent-gray-900"
                    />
                    {t('addons.available')}
                  </label>
                  <GlassButton type="button" variant="ghost" size="sm" onClick={() => removeAddonOption(group.id, option.id)}>
                    ×
                  </GlassButton>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => addAddonOption(group.id)}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                {t('addons.addOption')}
              </button>
              <GlassButton
                type="button" variant="ghost" size="sm"
                onClick={() => removeAddonGroup(group.id)}
                className="text-red-500 hover:text-red-600"
              >
                {t('addons.removeGroup')}
              </GlassButton>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ── Step 4: Schedule ──────────────────────────────────────────────────────────

interface Step4Props {
  scheduleEnabled: boolean;
  setScheduleEnabled: (v: boolean) => void;
  noEndDate: boolean;
  setNoEndDate: (v: boolean) => void;
  schedule: ScheduleState;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleState>>;
  scheduleError: boolean;
}

export function Step4Schedule({
  scheduleEnabled, setScheduleEnabled,
  noEndDate, setNoEndDate,
  schedule, setSchedule,
  scheduleError,
}: Step4Props) {
  const { t } = useTranslation();
  return (
    <GlassCard className="p-4 space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={scheduleEnabled}
          onChange={(e) => setScheduleEnabled(e.target.checked)}
          className="accent-gray-900"
        />
        <span className="text-sm font-medium text-gray-700">{t('products.scheduleTitle')}</span>
      </label>
      <p className="text-xs text-gray-400">{t('products.scheduleToggle')}</p>
      {scheduleEnabled && (
        <div className="space-y-3 pt-1">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">{t('products.scheduleStartDate')}</label>
              <input
                type="date"
                value={schedule.startDate}
                onChange={(e) => setSchedule((s) => ({ ...s, startDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
              />
            </div>
            {!noEndDate && (
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-gray-500 uppercase tracking-wide">{t('products.scheduleEndDate')}</label>
                <input
                  type="date"
                  value={schedule.endDate}
                  onChange={(e) => setSchedule((s) => ({ ...s, endDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={noEndDate}
              onChange={(e) => setNoEndDate(e.target.checked)}
              className="accent-gray-900"
            />
            {t('products.scheduleNoEndDate')}
          </label>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">{t('products.scheduleStartTime')}</label>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => setSchedule((s) => ({ ...s, startTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">{t('products.scheduleEndTime')}</label>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => setSchedule((s) => ({ ...s, endTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">{t('products.scheduleDaysOfWeek')}</label>
            <div className="flex flex-wrap gap-1.5">
              {([1,2,3,4,5,6,0] as number[]).map((day) => {
                const keys = ['scheduleSun','scheduleMon','scheduleTue','scheduleWed','scheduleThu','scheduleFri','scheduleSat'];
                const label = t(`products.${keys[day]}`);
                const isSelected = schedule.daysOfWeek.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSchedule((s) => ({
                      ...s,
                      daysOfWeek: isSelected
                        ? s.daysOfWeek.filter((d) => d !== day)
                        : [...s.daysOfWeek, day],
                    }))}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          {scheduleError && (
            <p className="text-xs text-red-500">{t('products.scheduleInvalid')}</p>
          )}
        </div>
      )}
    </GlassCard>
  );
}

// ── Step 5: Review ────────────────────────────────────────────────────────────

interface Step5Props {
  form: { name: string; description: string; price: number };
  imageFile: File | null;
  existingImageUrl?: string | null;
  selectedCategoryIds: string[];
  categories: { id: string; name: string }[];
  taxRates: { id: string; label: string }[];
  selectedTaxRateId: string | null;
  variantGroups: VariantGroup[];
  addonGroups: AddonGroup[];
  scheduleEnabled: boolean;
  noEndDate: boolean;
  schedule: ScheduleState;
  currencySymbol: string;
}

export function Step5Review({
  form, imageFile, existingImageUrl, selectedCategoryIds, categories, taxRates, selectedTaxRateId,
  variantGroups, addonGroups, scheduleEnabled, noEndDate, schedule, currencySymbol,
}: Step5Props) {
  const { t } = useTranslation();

  const selectedCategories = categories.filter(c => selectedCategoryIds.includes(c.id));
  const taxRate = taxRates.find(r => r.id === selectedTaxRateId);
  const displayImageUrl = imageFile ? URL.createObjectURL(imageFile) : existingImageUrl;

  const priceFormatted = (form.price / 100).toLocaleString(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const scheduleLabel = () => {
    if (!scheduleEnabled) return t('products.wizardReviewAlwaysAvailable');
    const parts: string[] = [];
    if (schedule.startDate) parts.push(schedule.startDate);
    if (!noEndDate && schedule.endDate) parts.push(`→ ${schedule.endDate}`);
    else if (noEndDate) parts.push('→ ∞');
    if (schedule.startTime || schedule.endTime) {
      parts.push(`${schedule.startTime || '?'} – ${schedule.endTime || '?'}`);
    }
    if (schedule.daysOfWeek.length > 0) {
      const keys = ['scheduleSun','scheduleMon','scheduleTue','scheduleWed','scheduleThu','scheduleFri','scheduleSat'];
      parts.push(schedule.daysOfWeek.map(d => t(`products.${keys[d]}`)).join(', '));
    }
    return parts.join(' · ') || t('products.wizardReviewAlwaysAvailable');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {displayImageUrl && (
          <img
            src={displayImageUrl}
            alt="preview"
            className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="text-lg font-semibold text-gray-900 truncate">{form.name}</p>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{form.description}</p>
          <p className="text-base font-medium text-emerald-600 mt-1">
            {currencySymbol}{priceFormatted}
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        <ReviewRow label={t('products.categories')}>
          {selectedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-end">
              {selectedCategories.map(c => (
                <span key={c.id} className="text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-700">
                  {c.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{t('products.wizardReviewNone')}</span>
          )}
        </ReviewRow>
        <ReviewRow label={t('products.taxRate')}>
          {taxRate ? taxRate.label : <span className="text-gray-400">{t('products.taxRateNone')}</span>}
        </ReviewRow>
        <ReviewRow label={t('variants.title')}>
          {variantGroups.length > 0
            ? t('products.wizardReviewVariants', { count: variantGroups.length })
            : <span className="text-gray-400">{t('products.wizardReviewNone')}</span>}
        </ReviewRow>
        <ReviewRow label={t('addons.title')}>
          {addonGroups.length > 0
            ? t('products.wizardReviewAddons', { count: addonGroups.length })
            : <span className="text-gray-400">{t('products.wizardReviewNone')}</span>}
        </ReviewRow>
        <ReviewRow label={t('products.scheduleTitle')}>
          <span className="text-right text-xs text-gray-600 max-w-[200px]">{scheduleLabel()}</span>
        </ReviewRow>
      </div>
    </div>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs text-gray-400 uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm text-gray-700 text-right">{children}</span>
    </div>
  );
}
