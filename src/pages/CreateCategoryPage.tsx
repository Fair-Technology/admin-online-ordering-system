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
import { useToast } from '../contexts/ToastContext';
import { IconPicker, LucideIconByName } from '../components/ui/IconPicker';

export function CreateCategoryPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { data: shop } = useGetShopByIdQuery({ shopId: shopId! });
  const { data: categories } = useGetCategoriesByShopQuery({ shopId: shopId! });
  const [createCategory, { isLoading, isError, error }] = useCreateCategoryMutation();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        shopId: shopId!,
        createCategoryRequest: { name, sortOrder: categories?.length ?? 0, icon: icon ?? undefined },
      }).unwrap();
      toast.success(t('categories.created'));
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
      <h1 className="text-2xl font-semibold text-gray-900">{t('categories.createTitle')}</h1>

      {isError && (
        <GlassCard className="p-4 !bg-red-50 !border-red-200">
          <p className="text-sm text-red-600">
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
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-gray-700">Icon <span className="text-gray-400 font-normal text-xs">(optional)</span></p>
            <IconPicker value={icon} onChange={(name) => setIcon(icon === name ? null : name)} />
            {icon && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                Selected: <LucideIconByName name={icon} size={13} /> {icon}
              </p>
            )}
          </div>
          <GlassButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('categories.creating') : t('categories.create')}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
