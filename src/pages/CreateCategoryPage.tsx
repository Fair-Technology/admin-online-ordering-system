import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateCategoryMutation } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

export function CreateCategoryPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [createCategory, { isLoading, isError, error }] = useCreateCategoryMutation();

  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        shopId: shopId!,
        createCategoryRequest: { name, sortOrder: sortOrder ? Number(sortOrder) : undefined },
      }).unwrap();
      navigate(`/shops/${shopId}/categories`);
    } catch {
      // error shown below
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-semibold text-white">Create Category</h1>

      {isError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">
            {(error as { data?: { error?: string } })?.data?.error ?? 'Failed to create category.'}
          </p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Name"
            type="text"
            required
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <GlassInput
            label="Sort Order"
            type="number"
            placeholder="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <GlassButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Category'}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
