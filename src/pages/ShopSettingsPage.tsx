import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useGetShopByIdQuery,
  useGenerateShopLogoUploadUrlMutation,
  useSetShopLogoMutation,
  useUpdateShopMutation,
} from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type TimeSlot = { open: string; close: string };
type OpeningHoursState = Record<DayKey, TimeSlot[]>;

const ALL_DAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DEFAULT_SLOT: TimeSlot = { open: '09:00', close: '17:00' };

function buildInitialHours(shopHours: Record<string, unknown> | undefined): OpeningHoursState {
  const result = {} as OpeningHoursState;
  for (const day of ALL_DAYS) {
    const slots = shopHours?.[day];
    result[day] = Array.isArray(slots) ? (slots as TimeSlot[]) : [];
  }
  return result;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ShopSettingsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const { data: shop, isLoading, isError, refetch } = useGetShopByIdQuery({ shopId: shopId! });
  const [generateShopLogoUploadUrl] = useGenerateShopLogoUploadUrlMutation();
  const [setShopLogo] = useSetShopLogoMutation();
  const [updateShop] = useUpdateShopMutation();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hoursState, setHoursState] = useState<OpeningHoursState | null>(null);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [hoursSaved, setHoursSaved] = useState(false);

  const [statusState, setStatusState] = useState<{
    acceptingOrders: boolean;
    isPaused: boolean;
    pausedMessage: string;
  } | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState(false);

  const [colorsState, setColorsState] = useState<{
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
  } | null>(null);
  const [isSavingColors, setIsSavingColors] = useState(false);
  const [colorsError, setColorsError] = useState<string | null>(null);
  const [colorsSaved, setColorsSaved] = useState(false);

  const [detailsState, setDetailsState] = useState<{
    name: string;
    currency: string;
    timezone: string;
    minOrderAmountDollars: string;
  } | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [addressState, setAddressState] = useState<{
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  } | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSaved, setAddressSaved] = useState(false);

  if (isLoading) return <GlassSpinner label={t('shops.loadingSettings')} />;
  if (isError || !shop) return <p className="text-red-400">{t('shops.failedToLoadShop')}</p>;

  const currentHours = hoursState ?? buildInitialHours(shop.openingHours as Record<string, unknown> | undefined);

  const currentStatus = statusState ?? {
    acceptingOrders: shop.acceptingOrders ?? true,
    isPaused: shop.isPaused ?? false,
    pausedMessage: shop.pausedMessage ?? '',
  };

  const currentColors = colorsState ?? {
    primary: shop.branding?.colors?.primary ?? '#3B82F6',
    secondary: shop.branding?.colors?.secondary ?? '#10B981',
    tertiary: shop.branding?.colors?.tertiary ?? '#F59E0B',
    background: shop.branding?.colors?.background ?? '#1F2937',
  };

  const currentDetails = detailsState ?? {
    name: shop.name ?? '',
    currency: shop.currency ?? '',
    timezone: shop.timezone ?? '',
    minOrderAmountDollars: shop.minOrderAmountCents != null
      ? String(shop.minOrderAmountCents / 100)
      : '',
  };

  const currentAddress = addressState ?? {
    street: shop.address?.street ?? '',
    city: shop.address?.city ?? '',
    state: shop.address?.state ?? '',
    postcode: shop.address?.postcode ?? '',
    country: shop.address?.country ?? '',
  };

  const DAYS: { key: DayKey; label: string }[] = [
    { key: 'mon', label: t('shops.ohMon') },
    { key: 'tue', label: t('shops.ohTue') },
    { key: 'wed', label: t('shops.ohWed') },
    { key: 'thu', label: t('shops.ohThu') },
    { key: 'fri', label: t('shops.ohFri') },
    { key: 'sat', label: t('shops.ohSat') },
    { key: 'sun', label: t('shops.ohSun') },
  ];

  function toggleDay(day: DayKey) {
    const next = { ...currentHours };
    next[day] = next[day].length > 0 ? [] : [{ ...DEFAULT_SLOT }];
    setHoursState(next);
    setHoursSaved(false);
  }

  function updateSlot(day: DayKey, idx: number, field: 'open' | 'close', value: string) {
    const next = { ...currentHours };
    next[day] = next[day].map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot));
    setHoursState(next);
    setHoursSaved(false);
  }

  function addSlot(day: DayKey) {
    const next = { ...currentHours };
    next[day] = [...next[day], { ...DEFAULT_SLOT }];
    setHoursState(next);
    setHoursSaved(false);
  }

  function removeSlot(day: DayKey, idx: number) {
    const next = { ...currentHours };
    next[day] = next[day].filter((_, i) => i !== idx);
    setHoursState(next);
    setHoursSaved(false);
  }

  const handleSaveHours = async () => {
    const hasOpenDay = ALL_DAYS.some((d) => currentHours[d].length > 0);
    if (!hasOpenDay) {
      setHoursError(t('shops.ohAtLeastOneDay'));
      return;
    }

    setIsSavingHours(true);
    setHoursError(null);
    setHoursSaved(false);

    try {
      await updateShop({
        shopId: shopId!,
        updateShopRequest: { openingHours: currentHours },
      }).unwrap();
      setHoursSaved(true);
      refetch();
    } catch {
      setHoursError(t('shops.ohFailedToSave'));
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleSaveStatus = async () => {
    setIsSavingStatus(true);
    setStatusError(null);
    setStatusSaved(false);

    try {
      await updateShop({
        shopId: shopId!,
        updateShopRequest: {
          acceptingOrders: currentStatus.acceptingOrders,
          isPaused: currentStatus.isPaused,
          pausedMessage: currentStatus.pausedMessage || undefined,
        },
      }).unwrap();
      setStatusSaved(true);
      refetch();
    } catch {
      setStatusError(t('shops.statusFailedToSave'));
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveColors = async () => {
    setIsSavingColors(true);
    setColorsError(null);
    setColorsSaved(false);
    try {
      await updateShop({
        shopId: shopId!,
        updateShopRequest: {
          branding: {
            logoUrl: shop.branding?.logoUrl ?? undefined,
            heroImageUrl: shop.branding?.heroImageUrl ?? undefined,
            colors: currentColors,
          },
        },
      }).unwrap();
      setColorsSaved(true);
      refetch();
    } catch {
      setColorsError(t('shops.colorsFailedToSave'));
    } finally {
      setIsSavingColors(false);
    }
  };

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    setDetailsError(null);
    setDetailsSaved(false);
    try {
      const dollars = parseFloat(currentDetails.minOrderAmountDollars);
      const cents = !isNaN(dollars) ? Math.round(dollars * 100) : undefined;
      await updateShop({
        shopId: shopId!,
        updateShopRequest: {
          name: currentDetails.name || undefined,
          currency: currentDetails.currency || undefined,
          timezone: currentDetails.timezone || undefined,
          ...(cents != null && { minOrderAmountCents: cents }),
        },
      }).unwrap();
      setDetailsSaved(true);
      refetch();
    } catch {
      setDetailsError(t('shops.detailsFailedToSave'));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    setAddressError(null);
    setAddressSaved(false);
    try {
      await updateShop({
        shopId: shopId!,
        updateShopRequest: { address: currentAddress },
      }).unwrap();
      setAddressSaved(true);
      refetch();
    } catch {
      setAddressError(t('shops.addressFailedToSave'));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const contentType = logoFile.type as 'image/jpeg' | 'image/png' | 'image/webp';
      const uploadData = await generateShopLogoUploadUrl({
        shopId: shopId!,
        generateShopLogoUploadUrlRequest: { contentType },
      }).unwrap();

      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': contentType },
        body: logoFile,
      });

      await setShopLogo({
        shopId: shopId!,
        setShopLogoRequest: { imageId: uploadData.imageId, url: uploadData.blobUrl },
      }).unwrap();

      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refetch();
    } catch {
      setUploadError(t('shops.failedToUploadLogo'));
    } finally {
      setIsUploading(false);
    }
  };

  const previewSlug = detailsState
    ? toSlug(detailsState.name) || shop.slug
    : shop.slug;

  const infoRows = [
    { label: t('shops.labelId'), value: shop.id, mono: true },
    { label: t('shops.labelSlug'), value: `/${previewSlug}`, mono: true },
  ];

  const currentLogoUrl = shop.branding?.logoUrl;

  return (
    <div className="max-w-lg space-y-4">
      <GlassCard>
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-5 py-4 ${
              i > 0 ? 'border-t border-white/8' : ''
            }`}
          >
            <span className="text-sm text-white/45">{row.label}</span>
            <span className={`text-sm text-white ${row.mono ? 'font-mono' : 'font-medium'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
          {t('shops.detailsTitle')}
        </p>

        <div className="space-y-3">
          <GlassInput
            label={t('shops.detailsName')}
            value={currentDetails.name}
            placeholder={t('shops.detailsName')}
            onChange={(e) => { setDetailsState({ ...currentDetails, name: e.target.value }); setDetailsSaved(false); }}
          />
          <GlassInput
            label={t('shops.detailsCurrency')}
            value={currentDetails.currency}
            placeholder={t('shops.detailsCurrencyPlaceholder')}
            onChange={(e) => { setDetailsState({ ...currentDetails, currency: e.target.value }); setDetailsSaved(false); }}
          />
          <GlassInput
            label={t('shops.detailsTimezone')}
            value={currentDetails.timezone}
            placeholder={t('shops.detailsTimezonePlaceholder')}
            onChange={(e) => { setDetailsState({ ...currentDetails, timezone: e.target.value }); setDetailsSaved(false); }}
          />
          <GlassInput
            label={t('shops.detailsMinOrder')}
            type="number"
            min="0"
            step="0.01"
            value={currentDetails.minOrderAmountDollars}
            placeholder={t('shops.detailsMinOrderPlaceholder')}
            onChange={(e) => { setDetailsState({ ...currentDetails, minOrderAmountDollars: e.target.value }); setDetailsSaved(false); }}
          />
        </div>

        {detailsError && <p className="text-sm text-red-300">{detailsError}</p>}
        {detailsSaved && <p className="text-sm text-green-300">{t('shops.detailsSaved')}</p>}

        <div className="border-t border-white/8 pt-4 flex gap-2">
          {detailsState && (
            <GlassButton
              variant="ghost"
              onClick={() => { setDetailsState(null); setDetailsError(null); setDetailsSaved(false); }}
              disabled={isSavingDetails}
            >
              {t('shops.detailsCancel')}
            </GlassButton>
          )}
          <GlassButton onClick={handleSaveDetails} disabled={isSavingDetails}>
            {isSavingDetails ? t('shops.detailsSaving') : t('shops.detailsSave')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
          {t('shops.logo')}
        </p>

        <div className="flex items-center gap-4">
          {currentLogoUrl ? (
            <img
              src={currentLogoUrl}
              alt="Shop logo"
              className="w-24 h-24 rounded-xl object-cover border border-white/15"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <span className="text-xs text-white/30">{t('shops.logoPlaceholder')}</span>
            </div>
          )}
        </div>

        {uploadError && (
          <p className="text-sm text-red-300">{uploadError}</p>
        )}

        <form onSubmit={handleLogoUpload} className="space-y-3">
          <div className="flex flex-col gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                setLogoFile(e.target.files?.[0] ?? null);
                setUploadError(null);
              }}
              className="block w-full text-sm text-white/45 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/15 file:text-white/75 hover:file:bg-white/20 cursor-pointer"
            />
            {logoFile && <p className="text-xs text-white/35">{logoFile.name}</p>}
          </div>

          <GlassButton type="submit" disabled={!logoFile || isUploading}>
            {isUploading ? t('shops.uploadingLogo') : t('shops.uploadLogo')}
          </GlassButton>
        </form>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
          {t('shops.colorsTitle')}
        </p>

        <div className="space-y-3">
          {(
            [
              { key: 'primary', label: t('shops.colorPrimary') },
              { key: 'secondary', label: t('shops.colorSecondary') },
              { key: 'tertiary', label: t('shops.colorTertiary') },
              { key: 'background', label: t('shops.colorBackground') },
            ] as { key: keyof typeof currentColors; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-white/70 w-28 shrink-0">{label}</span>
              <input
                type="color"
                value={currentColors[key]}
                onChange={(e) => {
                  setColorsState({ ...currentColors, [key]: e.target.value });
                  setColorsSaved(false);
                }}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
              />
              <input
                type="text"
                value={currentColors[key]}
                maxLength={7}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                    setColorsState({ ...currentColors, [key]: val });
                    setColorsSaved(false);
                  }
                }}
                className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-white/45 w-28"
              />
            </div>
          ))}
        </div>

        {colorsError && <p className="text-sm text-red-300">{colorsError}</p>}
        {colorsSaved && <p className="text-sm text-green-300">{t('shops.colorsSaved')}</p>}

        <div className="border-t border-white/8 pt-4">
          <GlassButton onClick={handleSaveColors} disabled={isSavingColors}>
            {isSavingColors ? t('shops.colorsSaving') : t('shops.colorsSave')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
          {t('shops.addressTitle')}
        </p>

        <div className="space-y-3">
          <GlassInput
            label={t('shops.addressStreet')}
            value={currentAddress.street}
            onChange={(e) => { setAddressState({ ...currentAddress, street: e.target.value }); setAddressSaved(false); }}
          />
          <GlassInput
            label={t('shops.addressCity')}
            value={currentAddress.city}
            onChange={(e) => { setAddressState({ ...currentAddress, city: e.target.value }); setAddressSaved(false); }}
          />
          <GlassInput
            label={t('shops.addressState')}
            value={currentAddress.state}
            onChange={(e) => { setAddressState({ ...currentAddress, state: e.target.value }); setAddressSaved(false); }}
          />
          <GlassInput
            label={t('shops.addressPostcode')}
            value={currentAddress.postcode}
            onChange={(e) => { setAddressState({ ...currentAddress, postcode: e.target.value }); setAddressSaved(false); }}
          />
          <GlassInput
            label={t('shops.addressCountry')}
            value={currentAddress.country}
            onChange={(e) => { setAddressState({ ...currentAddress, country: e.target.value }); setAddressSaved(false); }}
          />
        </div>

        {addressError && <p className="text-sm text-red-300">{addressError}</p>}
        {addressSaved && <p className="text-sm text-green-300">{t('shops.addressSaved')}</p>}

        <div className="border-t border-white/8 pt-4">
          <GlassButton onClick={handleSaveAddress} disabled={isSavingAddress}>
            {isSavingAddress ? t('shops.addressSaving') : t('shops.addressSave')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
          {t('shops.statusTitle')}
        </p>

        <div className="space-y-3">
          {/* Accepting Orders toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{t('shops.statusAcceptingOrders')}</span>
            <div className="flex gap-1.5">
              <GlassButton
                variant={currentStatus.acceptingOrders ? 'primary' : 'ghost'}
                onClick={() => {
                  setStatusState({ ...currentStatus, acceptingOrders: true });
                  setStatusSaved(false);
                }}
              >
                {t('shops.statusYes')}
              </GlassButton>
              <GlassButton
                variant={!currentStatus.acceptingOrders ? 'primary' : 'ghost'}
                onClick={() => {
                  setStatusState({ ...currentStatus, acceptingOrders: false });
                  setStatusSaved(false);
                }}
              >
                {t('shops.statusNo')}
              </GlassButton>
            </div>
          </div>

          {/* Paused toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{t('shops.statusPaused')}</span>
            <div className="flex gap-1.5">
              <GlassButton
                variant={currentStatus.isPaused ? 'primary' : 'ghost'}
                onClick={() => {
                  setStatusState({ ...currentStatus, isPaused: true });
                  setStatusSaved(false);
                }}
              >
                {t('shops.statusYes')}
              </GlassButton>
              <GlassButton
                variant={!currentStatus.isPaused ? 'primary' : 'ghost'}
                onClick={() => {
                  setStatusState({ ...currentStatus, isPaused: false });
                  setStatusSaved(false);
                }}
              >
                {t('shops.statusNo')}
              </GlassButton>
            </div>
          </div>

          {/* Pause message */}
          <div className="space-y-1.5">
            <span className="text-sm text-white/70">{t('shops.statusPauseMessage')}</span>
            <GlassInput
              value={currentStatus.pausedMessage}
              placeholder={t('shops.statusPauseMessagePlaceholder')}
              onChange={(e) => {
                setStatusState({ ...currentStatus, pausedMessage: e.target.value });
                setStatusSaved(false);
              }}
            />
          </div>
        </div>

        {statusError && <p className="text-sm text-red-300">{statusError}</p>}
        {statusSaved && <p className="text-sm text-green-300">{t('shops.statusSaved')}</p>}

        <div className="border-t border-white/8 pt-4">
          <GlassButton onClick={handleSaveStatus} disabled={isSavingStatus}>
            {isSavingStatus ? t('shops.statusSaving') : t('shops.statusSave')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-1">
          {t('shops.openingHours')}
        </p>

        <div className="space-y-0">
          {DAYS.map(({ key, label }) => {
            const slots = currentHours[key];
            const isOpen = slots.length > 0;

            return (
              <div key={key} className="border-t border-white/8 pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70 w-28 shrink-0">{label}</span>
                  <button
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      isOpen
                        ? 'bg-white/15 border-white/20 text-white'
                        : 'bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50'
                    }`}
                  >
                    {isOpen ? t('shops.ohOpen') : t('shops.ohClosed')}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-2.5 space-y-2 pl-0">
                    {slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.open}
                          onChange={(e) => updateSlot(key, idx, 'open', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-white/45 w-28"
                        />
                        <span className="text-xs text-white/35">{t('shops.ohTo')}</span>
                        <input
                          type="time"
                          value={slot.close}
                          onChange={(e) => updateSlot(key, idx, 'close', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-white/45 w-28"
                        />
                        {slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(key, idx)}
                            className="text-sm text-white/25 hover:text-red-400 transition-colors px-1 leading-none"
                            aria-label="Remove slot"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSlot(key)}
                      className="text-xs text-white/35 hover:text-white/60 transition-colors mt-1"
                    >
                      {t('shops.ohAddSlot')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {hoursError && <p className="text-sm text-red-300 mt-2">{hoursError}</p>}
        {hoursSaved && <p className="text-sm text-green-300 mt-2">{t('shops.ohHoursSaved')}</p>}

        <div className="mt-4 border-t border-white/8 pt-4">
          <GlassButton onClick={handleSaveHours} disabled={isSavingHours}>
            {isSavingHours ? t('shops.ohSavingHours') : t('shops.ohSaveHours')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <p className="text-xs text-white/25 mb-2 uppercase tracking-wide">Debug</p>
        <pre className="text-white/45 text-xs whitespace-pre-wrap">
          {JSON.stringify(shop, null, 2)}
        </pre>
      </GlassCard>
    </div>
  );
}
