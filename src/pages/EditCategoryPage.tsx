import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetShopByIdQuery } from '../services/api';
import { useGetCategoryByIdQuery, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../services/api';
import { MyCard } from '../components/ui/MyCard';
import { MyButton } from '../components/ui/MyButton';
import { MyInput } from '../components/ui/MyInput';
import { MySpinner } from '../components/ui/MySpinner';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useToast } from '../contexts/ToastContext';

export function EditCategoryPage() {
  const { shopId, categoryId } = useParams<{ shopId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();

  const { data: shop } = useGetShopByIdQuery({ shopId: shopId! });
  const { data: category, isLoading, isError } = useGetCategoryByIdQuery(
    { shopId: shopId!, categoryId: categoryId! },
    { refetchOnMountOrArgChange: true },
  );
  const [updateCategory, { isLoading: isUpdating, isError: isUpdateError }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting, isError: isDeleteError }] =
    useDeleteCategoryMutation();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name ?? '');
      setIcon(category.icon ?? null);
    }
  }, [category]);

  if (isLoading) return <MySpinner label={t('categories.loadingCategory')} />;
  if (isError || !category) return <p className="text-red-500">{t('categories.failedToLoad')}</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCategory({
        shopId: shopId!,
        categoryId: categoryId!,
        updateCategoryRequest: { name, icon: icon ?? undefined },
      }).unwrap();
      toast.success(t('categories.saved'));
      navigate(`/shops/${shopId}/categories`);
    } catch {
      // error shown below
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory({ shopId: shopId!, categoryId: categoryId! }).unwrap();
      toast.success(t('categories.deleted'));
      navigate(`/shops/${shopId}/categories`);
    } catch {
      setConfirmingDelete(false);
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
      <h1 className="text-2xl font-semibold text-gray-900">{t('categories.editTitle')}</h1>

      {isUpdateError && (
        <MyCard className="p-4 !bg-red-50 !border-red-200">
          <p className="text-sm text-red-600">{t('categories.failedToUpdate')}</p>
        </MyCard>
      )}

      {isDeleteError && (
        <MyCard className="p-4 !bg-red-50 !border-red-200">
          <p className="text-sm text-red-600">{t('categories.failedToDelete')}</p>
        </MyCard>
      )}

      <MyCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <MyInput
            label={t('categories.name')}
            type="text"
            required
            placeholder={t('categories.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-2">
            <MyButton
              type="button"
              variant="ghost"
              disabled={isUpdating}
              className="flex-1"
              onClick={() => navigate(`/shops/${shopId}/categories`)}
            >
              {t('categories.cancel')}
            </MyButton>
            <MyButton type="submit" disabled={isUpdating} className="flex-1">
              {isUpdating ? t('categories.saving') : t('categories.saveChanges')}
            </MyButton>
          </div>
        </form>
      </MyCard>

      <MyCard className="p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900">{t('categories.dangerZone')}</p>
          <p className="text-xs text-gray-400">{t('categories.deleteWarning')}</p>
          {confirmingDelete ? (
            <div className="space-y-3">
              <MyInput
                label={t('categories.deleteTypeToConfirm', { name: category.name })}
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={category.name}
              />
              <div className="flex gap-2">
                <MyButton
                  variant="danger"
                  disabled={isDeleting || deleteConfirmName !== category.name}
                  onClick={handleDelete}
                >
                  {isDeleting ? t('categories.deleting') : t('categories.confirmDelete')}
                </MyButton>
                <MyButton
                  variant="ghost"
                  disabled={isDeleting}
                  onClick={() => { setConfirmingDelete(false); setDeleteConfirmName(''); }}
                >
                  {t('categories.cancel')}
                </MyButton>
              </div>
            </div>
          ) : (
            <MyButton variant="danger" onClick={() => setConfirmingDelete(true)}>
              {t('categories.delete')}
            </MyButton>
          )}
        </div>
      </MyCard>
    </div>
  );
}
