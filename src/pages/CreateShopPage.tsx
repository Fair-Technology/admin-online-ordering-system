import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateShopMutation } from '../services/api';
import type { CreateShopRequest } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export function CreateShopPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [createShop, { isLoading, isError, error }] = useCreateShopMutation();

  const [form, setForm] = useState<Partial<CreateShopRequest>>({
    name: '',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    minOrderAmountCents: 0,
    paymentPolicy: 'pay_online',
    address: { street: '', city: '', state: '', postcode: '', country: 'Australia' },
    openingHours: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const shop = await createShop({ createShopRequest: form as CreateShopRequest }).unwrap();
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
          <GlassButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('shops.creating') : t('shops.create')}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
