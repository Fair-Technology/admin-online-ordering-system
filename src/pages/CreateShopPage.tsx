import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateShopMutation } from '../store/api/generatedApi';
import type { CreateShopRequest } from '../store/api/generatedApi';

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
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Shop</h1>
      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {(error as { data?: { error?: string } })?.data?.error ?? 'Failed to create shop.'}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
}
