import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMsal } from '@azure/msal-react';
import {
  useGetShopByIdQuery,
  useGenerateShopLogoUploadUrlMutation,
  useSetShopLogoMutation,
  useUpdateShopMutation,
  useAddShopMemberMutation,
  useRemoveShopMemberMutation,
  useCreateShopRoleMutation,
  useUpdateShopRoleMutation,
  useDeleteShopRoleMutation,
} from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { useToast } from '../contexts/ToastContext';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type TimeSlot = { open: string; close: string };
type OpeningHoursState = Record<DayKey, TimeSlot[]>;

const ALL_DAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DEFAULT_SLOT: TimeSlot = { open: '09:00', close: '17:00' };

const ALL_PERMISSIONS = ['view_orders', 'manage_products', 'manage_shop'] as const;
type ShopPermission = (typeof ALL_PERMISSIONS)[number];

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

const inputClass = 'w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400';

export function ShopSettingsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const { accounts } = useMsal();
  const currentUserId = accounts[0]?.localAccountId;
  const { data: shop, isLoading, isError, refetch } = useGetShopByIdQuery(
    { shopId: shopId! },
    { refetchOnMountOrArgChange: true },
  );
  const [generateShopLogoUploadUrl] = useGenerateShopLogoUploadUrlMutation();
  const [setShopLogo] = useSetShopLogoMutation();
  const [updateShop] = useUpdateShopMutation();
  const [addShopMember] = useAddShopMemberMutation();
  const [removeShopMember] = useRemoveShopMemberMutation();
  const [createShopRole] = useCreateShopRoleMutation();
  const [updateShopRole] = useUpdateShopRoleMutation();
  const [deleteShopRole] = useDeleteShopRoleMutation();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const [hoursState, setHoursState] = useState<OpeningHoursState | null>(null);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);

  const [statusState, setStatusState] = useState<{
    isPaused: boolean;
    pausedMessage: string;
  } | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [colorsState, setColorsState] = useState<{
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
  } | null>(null);
  const [isSavingColors, setIsSavingColors] = useState(false);
  const [colorsError, setColorsError] = useState<string | null>(null);

  const [detailsState, setDetailsState] = useState<{
    name: string;
    minOrderAmountCents: number;
  } | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [addressState, setAddressState] = useState<{
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  } | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRoleId, setNewMemberRoleId] = useState<string>('staff');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberAddError, setMemberAddError] = useState<string | null>(null);
  const [memberRemoveError, setMemberRemoveError] = useState<string | null>(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<ShopPermission[]>([]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [roleCreateError, setRoleCreateError] = useState<string | null>(null);

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRolePerms, setEditRolePerms] = useState<ShopPermission[]>([]);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [roleSaveError, setRoleSaveError] = useState<string | null>(null);
  const [roleDeleteError, setRoleDeleteError] = useState<string | null>(null);

  if (isLoading) return <GlassSpinner label={t('shops.loadingSettings')} />;
  if (isError || !shop) return <p className="text-red-500">{t('shops.failedToLoadShop')}</p>;

  const members = shop.members ?? [];
  const isCurrentUserOwner = members.some(
    (m) => m.userId === currentUserId && m.isActive && m.role === 'owner',
  );

  if (!isCurrentUserOwner) {
    return (
      <div className="max-w-lg">
        <GlassCard className="p-5">
          <p className="text-sm text-gray-600">{t('shops.membersAccessDenied')}</p>
        </GlassCard>
      </div>
    );
  }

  const shopRoles = shop.roles ?? [];

  const currentHours = hoursState ?? buildInitialHours(shop.openingHours as Record<string, unknown> | undefined);

  const currentStatus = statusState ?? {
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
    minOrderAmountCents: shop.minOrderAmountCents ?? 0,
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

  const PERM_LABELS: Record<ShopPermission, string> = {
    view_orders: t('shops.rolesPermViewOrders'),
    manage_products: t('shops.rolesPermManageProducts'),
    manage_shop: t('shops.rolesPermManageShop'),
  };

  function toggleDay(day: DayKey) {
    const next = { ...currentHours };
    next[day] = next[day].length > 0 ? [] : [{ ...DEFAULT_SLOT }];
    setHoursState(next);
  }

  function updateSlot(day: DayKey, idx: number, field: 'open' | 'close', value: string) {
    const next = { ...currentHours };
    next[day] = next[day].map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot));
    setHoursState(next);
  }

  function addSlot(day: DayKey) {
    const next = { ...currentHours };
    next[day] = [...next[day], { ...DEFAULT_SLOT }];
    setHoursState(next);
  }

  function removeSlot(day: DayKey, idx: number) {
    const next = { ...currentHours };
    next[day] = next[day].filter((_, i) => i !== idx);
    setHoursState(next);
  }

  const handleSaveHours = async () => {
    const hasOpenDay = ALL_DAYS.some((d) => currentHours[d].length > 0);
    if (!hasOpenDay) {
      setHoursError(t('shops.ohAtLeastOneDay'));
      return;
    }
    setIsSavingHours(true);
    setHoursError(null);
    try {
      await updateShop({
        shopId: shopId!,
        updateShopRequest: { openingHours: currentHours },
      }).unwrap();
      toast.success(t('shops.ohHoursSaved'));
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
    try {
      await updateShop({
        shopId: shopId!,
        updateShopRequest: {
          isPaused: currentStatus.isPaused,
          pausedMessage: currentStatus.pausedMessage || undefined,
        },
      }).unwrap();
      toast.success(t('shops.statusSaved'));
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
      toast.success(t('shops.colorsSaved'));
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
    try {
      const cents = currentDetails.minOrderAmountCents > 0 ? currentDetails.minOrderAmountCents : undefined;
      await updateShop({
        shopId: shopId!,
        updateShopRequest: {
          name: currentDetails.name || undefined,
          ...(cents != null && { minOrderAmountCents: cents }),
        },
      }).unwrap();
      toast.success(t('shops.detailsSaved'));
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
    try {
      await updateShop({
        shopId: shopId!,
        updateShopRequest: { address: currentAddress },
      }).unwrap();
      toast.success(t('shops.addressSaved'));
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
      toast.success(t('shops.logoSaved'));
      refetch();
    } catch {
      setUploadError(t('shops.failedToUploadLogo'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      setMemberAddError(t('shops.membersEmailRequired'));
      return;
    }
    setIsAddingMember(true);
    setMemberAddError(null);
    try {
      await addShopMember({
        shopId: shopId!,
        email: newMemberEmail.trim(),
        roleId: newMemberRoleId,
      }).unwrap();
      setNewMemberEmail('');
      setNewMemberRoleId('staff');
      toast.success(t('shops.membersInviteSent'));
      refetch();
    } catch (err: any) {
      const msg = err?.data?.error ?? t('shops.membersAddFailed');
      setMemberAddError(msg);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    setMemberRemoveError(null);
    try {
      await removeShopMember({ shopId: shopId!, userId: targetUserId }).unwrap();
      refetch();
    } catch (err: any) {
      const msg = err?.data?.error ?? t('shops.membersRemoveFailed');
      setMemberRemoveError(msg);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setIsCreatingRole(true);
    setRoleCreateError(null);
    try {
      await createShopRole({
        shopId: shopId!,
        name: newRoleName.trim(),
        permissions: newRolePerms,
      }).unwrap();
      setNewRoleName('');
      setNewRolePerms([]);
      toast.success(t('shops.rolesAddSuccess'));
      refetch();
    } catch (err: any) {
      setRoleCreateError(err?.data?.error ?? t('shops.rolesAddFailed'));
    } finally {
      setIsCreatingRole(false);
    }
  };

  const startEditRole = (role: { id?: string; name?: string; permissions?: string[] }) => {
    setEditingRoleId(role.id ?? '');
    setEditRoleName(role.name ?? '');
    setEditRolePerms((role.permissions ?? []) as ShopPermission[]);
    setRoleSaveError(null);
  };

  const handleSaveRole = async () => {
    if (!editingRoleId) return;
    setIsSavingRole(true);
    setRoleSaveError(null);
    try {
      await updateShopRole({
        shopId: shopId!,
        roleId: editingRoleId,
        name: editRoleName,
        permissions: editRolePerms,
      }).unwrap();
      setEditingRoleId(null);
      refetch();
    } catch (err: any) {
      setRoleSaveError(err?.data?.error ?? t('shops.rolesAddFailed'));
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    setRoleDeleteError(null);
    try {
      await deleteShopRole({ shopId: shopId!, roleId }).unwrap();
      refetch();
    } catch (err: any) {
      setRoleDeleteError(err?.data?.error ?? t('shops.rolesDeleteFailed'));
    }
  };

  const previewSlug = detailsState
    ? toSlug(detailsState.name) || shop.slug
    : shop.slug;

  const shopUrl = `${import.meta.env.VITE_SHOP_BASE_URL ?? 'https://www.example.com'}/shops/${previewSlug}`;

  const handleDownloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewSlug}-qr.png`;
    a.click();
  };

  const infoRows = [
    { label: t('shops.labelId'), value: shop.id, mono: true },
    { label: t('shops.labelSlug'), value: `/${previewSlug}`, mono: true },
  ];

  const currentLogoUrl = shop.branding?.logoUrl;

  const roleOptions = [
    { id: 'owner', name: 'Owner' },
    ...shopRoles.map((r) => ({ id: r.id ?? '', name: r.name ?? '' })),
  ];

  return (
    <div className="max-w-lg space-y-4">
      <GlassCard>
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-5 py-4 ${
              i > 0 ? 'border-t border-gray-200' : ''
            }`}
          >
            <span className="text-sm text-gray-400">{row.label}</span>
            <span className={`text-sm text-gray-900 ${row.mono ? 'font-mono' : 'font-medium'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </GlassCard>

      <GlassCard className="p-5 flex flex-col items-center gap-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide self-start">
          QR Code
        </p>
        <QRCodeCanvas
          ref={qrRef}
          value={shopUrl}
          size={160}
          marginSize={1}
        />
        <p className="text-xs text-gray-400 font-mono break-all text-center">{shopUrl}</p>
        <GlassButton type="button" variant="secondary" size="sm" onClick={handleDownloadQr}>
          Download PNG
        </GlassButton>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('shops.detailsTitle')}
        </p>
        <div className="space-y-3">
          <GlassInput
            label={t('shops.detailsName')}
            value={currentDetails.name}
            placeholder={t('shops.detailsName')}
            onChange={(e) => setDetailsState({ ...currentDetails, name: e.target.value })}
          />
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('shops.detailsCurrency')}</p>
            <p className="text-sm text-gray-700">{shop.currency ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('shops.detailsTimezone')}</p>
            <p className="text-sm text-gray-700">{shop.timezone ?? '—'}</p>
          </div>
          <CurrencyInput
            label={t('shops.detailsMinOrder')}
            valueCents={currentDetails.minOrderAmountCents}
            onChange={(cents) => setDetailsState({ ...currentDetails, minOrderAmountCents: cents })}
          />
        </div>
        {detailsError && <p className="text-sm text-red-600">{detailsError}</p>}
        <div className="border-t border-gray-200 pt-4 flex gap-2">
          {detailsState && (
            <GlassButton
              variant="ghost"
              onClick={() => { setDetailsState(null); setDetailsError(null); }}
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
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('shops.logo')}
        </p>
        <div className="flex items-center gap-4">
          {currentLogoUrl ? (
            <img
              src={currentLogoUrl}
              alt="Shop logo"
              className="w-24 h-24 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-400">{t('shops.logoPlaceholder')}</span>
            </div>
          )}
        </div>
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
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
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
            {logoFile && <p className="text-xs text-gray-400">{logoFile.name}</p>}
          </div>
          <GlassButton type="submit" disabled={!logoFile || isUploading}>
            {isUploading ? t('shops.uploadingLogo') : t('shops.uploadLogo')}
          </GlassButton>
        </form>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
              <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
              <input
                type="color"
                value={currentColors[key]}
                onChange={(e) => setColorsState({ ...currentColors, [key]: e.target.value })}
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
                  }
                }}
                className={`${inputClass} w-28 font-mono`}
              />
            </div>
          ))}
        </div>
        {colorsError && <p className="text-sm text-red-600">{colorsError}</p>}
        <div className="border-t border-gray-200 pt-4">
          <GlassButton onClick={handleSaveColors} disabled={isSavingColors}>
            {isSavingColors ? t('shops.colorsSaving') : t('shops.colorsSave')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('shops.addressTitle')}
        </p>
        <div className="space-y-3">
          <GlassInput
            label={t('shops.addressStreet')}
            value={currentAddress.street}
            onChange={(e) => setAddressState({ ...currentAddress, street: e.target.value })}
          />
          <GlassInput
            label={t('shops.addressCity')}
            value={currentAddress.city}
            onChange={(e) => setAddressState({ ...currentAddress, city: e.target.value })}
          />
          <GlassInput
            label={t('shops.addressState')}
            value={currentAddress.state}
            onChange={(e) => setAddressState({ ...currentAddress, state: e.target.value })}
          />
          <GlassInput
            label={t('shops.addressPostcode')}
            value={currentAddress.postcode}
            onChange={(e) => setAddressState({ ...currentAddress, postcode: e.target.value })}
          />
          <GlassInput
            label={t('shops.addressCountry')}
            value={currentAddress.country}
            onChange={(e) => setAddressState({ ...currentAddress, country: e.target.value })}
          />
        </div>
        {addressError && <p className="text-sm text-red-600">{addressError}</p>}
        <div className="border-t border-gray-200 pt-4">
          <GlassButton onClick={handleSaveAddress} disabled={isSavingAddress}>
            {isSavingAddress ? t('shops.addressSaving') : t('shops.addressSave')}
          </GlassButton>
        </div>
      </GlassCard>

      {/* Tax Rates card */}
      <GlassCard className="p-5 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('shops.taxRatesTitle')}
        </p>
        {(shop.taxRates ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">{t('shops.taxRatesEmpty')}</p>
        ) : (
          <div className="space-y-0">
            {(shop.taxRates ?? []).map((rate) => (
              <div
                key={rate.id}
                className="flex items-center justify-between border-t border-gray-200 py-2.5 first:border-t-0 first:pt-0"
              >
                <span className="text-sm text-gray-700">{rate.label}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                  {rate.rate != null ? `${(rate.rate * 100).toFixed(1).replace(/\.0$/, '')}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
        {shop.countryCode && (
          <p className="text-xs text-gray-400">
            {t('shops.taxRatesNote', { country: shop.countryCode })}
          </p>
        )}
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('shops.statusTitle')}
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('shops.statusPaused')}</span>
            <div className="flex gap-1.5">
              <GlassButton
                variant={currentStatus.isPaused ? 'primary' : 'ghost'}
                onClick={() => setStatusState({ ...currentStatus, isPaused: true })}
              >
                {t('shops.statusYes')}
              </GlassButton>
              <GlassButton
                variant={!currentStatus.isPaused ? 'primary' : 'ghost'}
                onClick={() => setStatusState({ ...currentStatus, isPaused: false })}
              >
                {t('shops.statusNo')}
              </GlassButton>
            </div>
          </div>
          {currentStatus.isPaused && (
            <div className="space-y-1.5">
              <span className="text-sm text-gray-600">{t('shops.statusPauseMessage')}</span>
              <GlassInput
                value={currentStatus.pausedMessage}
                placeholder={t('shops.statusPauseMessagePlaceholder')}
                onChange={(e) => setStatusState({ ...currentStatus, pausedMessage: e.target.value })}
              />
            </div>
          )}
        </div>
        {statusError && <p className="text-sm text-red-600">{statusError}</p>}
        <div className="border-t border-gray-200 pt-4">
          <GlassButton onClick={handleSaveStatus} disabled={isSavingStatus}>
            {isSavingStatus ? t('shops.statusSaving') : t('shops.statusSave')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {t('shops.openingHours')}
        </p>
        <div className="space-y-0">
          {DAYS.map(({ key, label }) => {
            const slots = currentHours[key];
            const isOpen = slots.length > 0;
            return (
              <div key={key} className="border-t border-gray-200 pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
                  <button
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      isOpen
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
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
                          className={`${inputClass} w-28`}
                        />
                        <span className="text-xs text-gray-400">{t('shops.ohTo')}</span>
                        <input
                          type="time"
                          value={slot.close}
                          onChange={(e) => updateSlot(key, idx, 'close', e.target.value)}
                          className={`${inputClass} w-28`}
                        />
                        {slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(key, idx)}
                            className="text-sm text-gray-300 hover:text-red-500 transition-colors px-1 leading-none"
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
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors mt-1"
                    >
                      {t('shops.ohAddSlot')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {hoursError && <p className="text-sm text-red-600 mt-2">{hoursError}</p>}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <GlassButton onClick={handleSaveHours} disabled={isSavingHours}>
            {isSavingHours ? t('shops.ohSavingHours') : t('shops.ohSaveHours')}
          </GlassButton>
        </div>
      </GlassCard>

      {/* Roles card */}
      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('shops.rolesTitle')}
        </p>
        {shopRoles.length === 0 && (
          <p className="text-sm text-gray-400">{t('shops.rolesEmpty')}</p>
        )}
        <div className="space-y-0">
          {shopRoles.map((role) => {
            const isEditing = editingRoleId === role.id;
            const membersUsingRole = members.filter(
              (m) => m.isActive && m.role === role.id,
            ).length;
            return (
              <div
                key={role.id}
                className="border-t border-gray-200 py-3 first:border-t-0 first:pt-0"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <GlassInput
                      label={t('shops.detailsName')}
                      value={editRoleName}
                      onChange={(e) => setEditRoleName(e.target.value)}
                    />
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">{t('shops.rolesTitle')}</span>
                      <div className="flex flex-wrap gap-2">
                        {ALL_PERMISSIONS.map((perm) => (
                          <label key={perm} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editRolePerms.includes(perm)}
                              onChange={(e) => {
                                setEditRolePerms(
                                  e.target.checked
                                    ? [...editRolePerms, perm]
                                    : editRolePerms.filter((p) => p !== perm),
                                );
                              }}
                              className="accent-gray-900"
                            />
                            <span className="text-xs text-gray-600">{PERM_LABELS[perm]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {roleSaveError && <p className="text-sm text-red-600">{roleSaveError}</p>}
                    <div className="flex gap-2">
                      <GlassButton onClick={handleSaveRole} disabled={isSavingRole}>
                        {isSavingRole ? t('shops.rolesAdding') : t('shops.rolesSave')}
                      </GlassButton>
                      <GlassButton variant="ghost" onClick={() => setEditingRoleId(null)}>
                        {t('shops.detailsCancel')}
                      </GlassButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-900 font-medium">{role.name}</span>
                      {(role.permissions ?? []).map((perm) => (
                        <span
                          key={perm}
                          className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                        >
                          {PERM_LABELS[perm as ShopPermission] ?? perm}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <GlassButton variant="ghost" onClick={() => startEditRole(role)}>
                        Edit
                      </GlassButton>
                      <GlassButton
                        variant="ghost"
                        disabled={membersUsingRole > 0}
                        onClick={() => handleDeleteRole(role.id ?? '')}
                      >
                        {t('shops.rolesDelete')}
                      </GlassButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {roleDeleteError && <p className="text-sm text-red-600">{roleDeleteError}</p>}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{t('shops.rolesAdd')}</p>
          <GlassInput
            label={t('shops.detailsName')}
            value={newRoleName}
            placeholder="e.g. Kitchen"
            onChange={(e) => {
              setNewRoleName(e.target.value);
              setRoleCreateError(null);
            }}
          />
          <div className="space-y-1">
            <span className="text-xs text-gray-500">{t('shops.rolesTitle')}</span>
            <div className="flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRolePerms.includes(perm)}
                    onChange={(e) => {
                      setNewRolePerms(
                        e.target.checked
                          ? [...newRolePerms, perm]
                          : newRolePerms.filter((p) => p !== perm),
                      );
                    }}
                    className="accent-gray-900"
                  />
                  <span className="text-xs text-gray-600">{PERM_LABELS[perm]}</span>
                </label>
              ))}
            </div>
          </div>
          {roleCreateError && <p className="text-sm text-red-600">{roleCreateError}</p>}
          <GlassButton
            onClick={handleCreateRole}
            disabled={isCreatingRole || !newRoleName.trim()}
          >
            {isCreatingRole ? t('shops.rolesAdding') : t('shops.rolesAdd')}
          </GlassButton>
        </div>
      </GlassCard>

      {/* Members card */}
      <GlassCard className="p-5 space-y-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('shops.membersTitle')}
        </p>
        <div className="space-y-0">
          {members.length === 0 && (
            <p className="text-sm text-gray-400">{t('shops.membersEmpty')}</p>
          )}
          {members.map((member) => {
            const activeOwnerCount = members.filter(
              (m) => m.isActive && m.role === 'owner',
            ).length;
            const isLastActiveOwner =
              member.isActive && member.role === 'owner' && activeOwnerCount === 1;
            const roleName = member.role === 'owner'
              ? 'Owner'
              : shopRoles.find((r) => r.id === member.role)?.name ?? member.role;
            return (
              <div
                key={member.userId}
                className="flex items-center justify-between border-t border-gray-200 py-3 first:border-t-0 first:pt-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="text-sm text-gray-900 font-mono truncate"
                    title={member.userId}
                  >
                    {(member.userId ?? '').slice(0, 8)}…
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      member.role === 'owner'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {roleName}
                  </span>
                  {!member.isActive && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                      {t('shops.membersInvited')}
                    </span>
                  )}
                </div>
                <GlassButton
                  variant="ghost"
                  disabled={isLastActiveOwner}
                  onClick={() => handleRemoveMember(member.userId!)}
                >
                  {t('shops.membersRemove')}
                </GlassButton>
              </div>
            );
          })}
        </div>
        {memberRemoveError && <p className="text-sm text-red-600">{memberRemoveError}</p>}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {t('shops.membersAddTitle')}
          </p>
          <GlassInput
            label={t('shops.membersEmail')}
            type="email"
            value={newMemberEmail}
            placeholder={t('shops.membersEmailPlaceholder')}
            onChange={(e) => {
              setNewMemberEmail(e.target.value);
              setMemberAddError(null);
            }}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">{t('shops.membersRoleLabel')}</span>
            <select
              value={newMemberRoleId}
              onChange={(e) => setNewMemberRoleId(e.target.value)}
              className={inputClass}
            >
              {roleOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
          {memberAddError && <p className="text-sm text-red-600">{memberAddError}</p>}
          <GlassButton onClick={handleAddMember} disabled={isAddingMember}>
            {isAddingMember ? t('shops.membersAdding') : t('shops.membersAdd')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Debug</p>
        <pre className="text-gray-500 text-xs whitespace-pre-wrap">
          {JSON.stringify(shop, null, 2)}
        </pre>
      </GlassCard>
    </div>
  );
}
