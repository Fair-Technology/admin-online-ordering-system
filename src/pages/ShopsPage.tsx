import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import {
  useGetMyShopsQuery,
  useGetShopSubscriptionQuery,
  useCreateShopMutation,
} from '../services/api';
import type { CreateShopRequest } from '../services/api';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { useToast } from '../contexts/ToastContext';

const COUNTRY_OPTIONS = [
  { code: 'AU', label: 'Australia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'DE', label: 'Germany' },
  { code: 'AT', label: 'Austria' },
  { code: 'FR', label: 'France' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'SG', label: 'Singapore' },
  { code: 'JP', label: 'Japan' },
] as const;

const INDUSTRY_OPTIONS = [
  'Food & Beverage',
  'Fashion & Apparel',
  'Beauty & Personal Care',
  'Grocery & Essentials',
  'Toys, Kids & Baby',
  'Electronics & Gadgets',
  'Home & Living',
  'Health & Fitness',
  'Pet Supplies',
  'Services & Custom Orders',
  'Other',
] as const;

const COUNTRY_DEFAULTS: Record<string, { currency: string; timezone: string }> = {
  AU: { currency: 'AUD', timezone: 'Australia/Sydney' },
  NZ: { currency: 'NZD', timezone: 'Pacific/Auckland' },
  DE: { currency: 'EUR', timezone: 'Europe/Berlin' },
  AT: { currency: 'EUR', timezone: 'Europe/Vienna' },
  FR: { currency: 'EUR', timezone: 'Europe/Paris' },
  NL: { currency: 'EUR', timezone: 'Europe/Amsterdam' },
  GB: { currency: 'GBP', timezone: 'Europe/London' },
  CH: { currency: 'CHF', timezone: 'Europe/Zurich' },
  US: { currency: 'USD', timezone: 'America/New_York' },
  CA: { currency: 'CAD', timezone: 'America/Toronto' },
  SG: { currency: 'SGD', timezone: 'Asia/Singapore' },
  JP: { currency: 'JPY', timezone: 'Asia/Tokyo' },
};

function CreateShopModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [createShop, { isLoading, isError, error }] = useCreateShopMutation();

  const [industryOther, setIndustryOther] = useState('');
  const [form, setForm] = useState<Partial<CreateShopRequest>>({
    name: '',
    countryCode: 'AU',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    minOrderAmountCents: 0,
    paymentPolicy: 'pay_online',
    address: { street: '', city: '', state: '', postcode: '', country: 'Australia' },
    openingHours: {
      mon: [{ open: '09:00', close: '17:00' }],
      tue: [{ open: '09:00', close: '17:00' }],
      wed: [{ open: '09:00', close: '17:00' }],
      thu: [{ open: '09:00', close: '17:00' }],
      fri: [{ open: '09:00', close: '17:00' }],
      sat: [],
      sun: [],
    },
  });

  const handleCountryChange = (countryCode: string) => {
    const defaults = COUNTRY_DEFAULTS[countryCode];
    setForm((f) => ({
      ...f,
      countryCode,
      ...(defaults ? { currency: defaults.currency, timezone: defaults.timezone } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedIndustry =
      form.industry === 'Other' ? industryOther.trim() : form.industry;
    if (!resolvedIndustry) return;
    try {
      const shop = await createShop({
        createShopRequest: {
          ...form,
          industry: resolvedIndustry,
        } as CreateShopRequest,
      }).unwrap();
      toast.success(t('shops.created'));
      onClose();
      navigate(`/shops/${shop.id}`);
    } catch {
      // error shown below
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{t('shops.newShop')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('shops.createSubtitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">
              {isError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {(error as { data?: { error?: string } })?.data?.error ?? t('shops.failedToCreate')}
                  </p>
                </div>
              )}

              <GlassInput
                label={t('shops.shopName')}
                type="text"
                required
                placeholder={t('shops.shopNamePlaceholder')}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Industry</label>
                <select
                  required
                  value={form.industry ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                >
                  <option value="" disabled>Select an industry…</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {form.industry === 'Other' && (
                  <input
                    type="text"
                    placeholder="Describe your industry…"
                    value={industryOther}
                    onChange={(e) => setIndustryOther(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">{t('shops.shopCountry')}</label>
                <select
                  required
                  value={form.countryCode ?? 'AU'}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-6 pb-5">
              <GlassButton type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? t('shops.creating') : t('shops.create')}
              </GlassButton>
              <GlassButton type="button" variant="secondary" onClick={onClose}>
                {t('products.cancel')}
              </GlassButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function ShopPlanBadge({ shopId }: { shopId: string }) {
  const { data } = useGetShopSubscriptionQuery({ shopId });
  const navigate = useNavigate();

  if (!data) return null;

  const planName = data.plan?.name ?? 'Free';
  const isActive = data.subscription.status === 'active';

  return (
    <span
      role="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/shops/${shopId}/subscription`);
      }}
      className={`mt-1.5 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
        isActive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      {planName}
    </span>
  );
}

export function ShopsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError } = useGetMyShopsQuery();

  const showModal = searchParams.get('addShop') === '1';
  const closeModal = () => setSearchParams((p) => { const n = new URLSearchParams(p); n.delete('addShop'); return n; });

  if (isLoading) return <GlassSpinner label={t('shops.loading')} />;
  if (isError) return <p className="text-red-500">{t('shops.loadError')}</p>;

  return (
    <>
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold text-gray-900">{t('shops.title')}</h1>

        {data?.shops.length === 0 && (
          <p className="text-gray-400 text-sm">{t('shops.empty')}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data?.shops.map((shop) => (
            <Link
              key={shop.id}
              to={`/shops/${shop.id}`}
              className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 cursor-pointer overflow-hidden block transition-all"
            >
              <div className="aspect-square w-full bg-gray-50 flex items-center justify-center">
                {shop.branding?.logoUrl ? (
                  <img src={shop.branding.logoUrl} alt={shop.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl font-semibold text-gray-200">
                    {shop.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 text-sm leading-snug truncate">{shop.name}</p>
                <ShopPlanBadge shopId={shop.id!} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {showModal && <CreateShopModal onClose={closeModal} />}
    </>
  );
}
