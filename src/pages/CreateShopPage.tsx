import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateShopMutation } from '../store/api/generatedApi';
import type { CreateShopRequest } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

export function CreateShopPage() {
  const navigate = useNavigate();
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
      <h1 className="text-2xl font-semibold text-white">Create Shop</h1>

      {isError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">
            {(error as { data?: { error?: string } })?.data?.error ?? 'Failed to create shop.'}
          </p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Shop Name"
            type="text"
            required
            placeholder="My Shop"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <GlassButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Shop'}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
