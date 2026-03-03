import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetShopByIdQuery } from '../services/api';
import {
  useCreateCategoryMutation,
  useGetCategoriesByShopQuery,
} from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export function CreateCategoryPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: shop } = useGetShopByIdQuery({ shopId: shopId! });
  const { data: categories } = useGetCategoriesByShopQuery({ shopId: shopId! });
  const [createCategory, { isLoading, isError, error }] = useCreateCategoryMutation();

  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        shopId: shopId!,
        createCategoryRequest: { name, sortOrder: categories?.length ?? 0 },
      }).unwrap();
      navigate(`/shops/${shopId}/categories`);
    } catch {
      // error shown below
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <Breadcrumb items={[
        { label: t('nav.shops'), to: '/shops' },
        { label: shop?.name ?? t('shops.shop'), to: `/shops/${shopId}` },
        { label: t('categories.newCategory') },
      ]} />
      <h1 className="text-2xl font-semibold text-white">{t('categories.createTitle')}</h1>

      {isError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">
            {(error as { data?: { error?: string } })?.data?.error ?? t('categories.failedToCreate')}
          </p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label={t('categories.name')}
            type="text"
            required
            placeholder={t('categories.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <GlassButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('categories.creating') : t('categories.create')}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
