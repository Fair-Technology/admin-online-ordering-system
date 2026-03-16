import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateShopMutation } from '../services/api';
import type { CreateShopRequest } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Breadcrumb } from '../components/ui/Breadcrumb';
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

export function CreateShopPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const [createShop, { isLoading, isError, error }] = useCreateShopMutation();

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
    try {
      const shop = await createShop({ createShopRequest: form as CreateShopRequest }).unwrap();
      toast.success(t('shops.created'));
      navigate(`/shops/${shop.id}`);
    } catch {
      // error shown below
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <Breadcrumb items={[{ label: t('nav.shops'), to: '/shops' }, { label: t('shops.newShop') }]} />
      <h1 className="text-2xl font-semibold text-white">{t('shops.createTitle')}</h1>

      {isError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">
            {(error as { data?: { error?: string } })?.data?.error ?? t('shops.failedToCreate')}
          </p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label={t('shops.shopName')}
            type="text"
            required
            placeholder={t('shops.shopNamePlaceholder')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wide">
              {t('shops.shopCountry')}
            </label>
            <select
              required
              value={form.countryCode ?? 'AU'}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/45"
            >
              <option value="" disabled className="bg-gray-900 text-white/50">
                {t('shops.shopCountryPlaceholder')}
              </option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <GlassButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('shops.creating') : t('shops.create')}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
