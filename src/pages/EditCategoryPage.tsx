import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCategoryByIdQuery, useUpdateCategoryMutation, useGetShopByIdQuery } from '../store/api/generatedApi';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export function EditCategoryPage() {
  const { shopId, categoryId } = useParams<{ shopId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: shop } = useGetShopByIdQuery({ shopId: shopId! });
  const { data: category, isLoading, isError } = useGetCategoryByIdQuery({
    shopId: shopId!,
    categoryId: categoryId!,
  });
  const [updateCategory, { isLoading: isUpdating, isError: isUpdateError }] =
    useUpdateCategoryMutation();

  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name ?? '');
      setSortOrder(category.sortOrder != null ? String(category.sortOrder) : '');
    }
  }, [category]);

  if (isLoading) return <GlassSpinner label={t('categories.loadingCategory')} />;
  if (isError || !category) return <p className="text-red-400">{t('categories.failedToLoad')}</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCategory({
        shopId: shopId!,
        categoryId: categoryId!,
        updateCategoryRequest: {
          name,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
        },
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
        { label: t('nav.categories'), to: `/shops/${shopId}/categories` },
        { label: t('categories.editTitle') },
      ]} />
      <h1 className="text-2xl font-semibold text-white">{t('categories.editTitle')}</h1>

      {isUpdateError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">{t('categories.failedToUpdate')}</p>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label={t('categories.name')}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <GlassInput
            label={t('categories.sortOrder')}
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="0"
          />
          <GlassButton type="submit" disabled={isUpdating} className="w-full">
            {isUpdating ? t('categories.saving') : t('categories.saveChanges')}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
