import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, X } from 'lucide-react';
import { IconPicker, LucideIconByName } from '../components/ui/IconPicker';
import {
  useGetCategoriesByShopQuery,
  useUpdateCategoryMutation,
  useCreateCategoryMutation,
} from '../services/api';
import type { GetCategoriesByShopApiResponse } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { useToast } from '../contexts/ToastContext';

type Category = NonNullable<GetCategoriesByShopApiResponse>[number];

// ── Create Category Modal ──────────────────────────────────────────────────────

function CreateCategoryModal({
  shopId,
  existingCount,
  onClose,
}: {
  shopId: string;
  existingCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [createCategory, { isLoading, isError, error }] = useCreateCategoryMutation();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        shopId,
        createCategoryRequest: { name, sortOrder: existingCount, icon: icon ?? undefined },
      }).unwrap();
      toast.success(t('categories.created'));
      onClose();
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
              <h2 className="text-base font-semibold text-gray-900">{t('categories.newCategory')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('categories.createSubtitle')}</p>
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
                    {(error as { data?: { error?: string } })?.data?.error ?? t('categories.failedToCreate')}
                  </p>
                </div>
              )}
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
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-6 pb-5">
              <GlassButton type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? t('categories.creating') : t('categories.create')}
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

// ── Sortable category row ──────────────────────────────────────────────────────

interface SortableCategoryItemProps {
  cat: Category;
  shopId: string;
}

function SortableCategoryItem({ cat, shopId }: SortableCategoryItemProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-5 py-4">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        aria-label={t('categories.dragHandle')}
        type="button"
      >
        <GripVertical size={18} />
      </button>

      {/* Name */}
      <p className="font-medium text-gray-900 truncate">{cat.name}</p>

      {/* Icon */}
      <div className="flex items-center gap-1.5 text-gray-500">
        {cat.icon ? (
          <>
            <LucideIconByName name={cat.icon} size={15} />
            <span className="text-xs text-gray-400">{cat.icon}</span>
          </>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      {/* Edit */}
      <Link
        to={`/shops/${shopId}/categories/${cat.id}/edit`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label={t('categories.edit')}
      >
        <Pencil size={15} />
      </Link>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function CategoriesPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories, isLoading, isError } = useGetCategoriesByShopQuery({ shopId: shopId! });
  const [updateCategory] = useUpdateCategoryMutation();

  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [reorderError, setReorderError] = useState(false);
  const isReordering = useRef(false);

  useEffect(() => {
    if (categories && !isReordering.current) {
      setOrderedCategories(categories);
    }
  }, [categories]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCategories.findIndex((c) => c.id === active.id);
    const newIndex = orderedCategories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const snapshot = orderedCategories;
    const reordered = arrayMove(orderedCategories, oldIndex, newIndex);

    isReordering.current = true;
    setOrderedCategories(reordered);
    setReorderError(false);

    try {
      await Promise.all(
        reordered.map((cat, index) =>
          updateCategory({
            shopId: shopId!,
            categoryId: cat.id!,
            updateCategoryRequest: { sortOrder: index },
          }).unwrap(),
        ),
      );
      toast.success(t('categories.reordered'));
    } catch {
      setOrderedCategories(snapshot);
      setReorderError(true);
    } finally {
      isReordering.current = false;
    }
  };

  const showModal = searchParams.get('addCategory') === '1';
  const closeModal = () => setSearchParams((p) => { const n = new URLSearchParams(p); n.delete('addCategory'); return n; });

  if (isLoading) return <GlassSpinner label={t('categories.loading')} />;
  if (isError) return <p className="text-red-500">{t('categories.loadError')}</p>;

  return (
    <>
      <div className="space-y-4">
        {reorderError && (
          <GlassCard className="p-4 !bg-red-50 !border-red-200">
            <p className="text-sm text-red-600">{t('categories.failedToReorder')}</p>
          </GlassCard>
        )}

        <GlassCard>
          {orderedCategories.length === 0 && !isLoading && (
            <p className="p-5 text-gray-400 text-sm">{t('categories.empty')}</p>
          )}
          {orderedCategories.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedCategories.map((c) => c.id!)} strategy={verticalListSortingStrategy}>
                {/* Header row */}
                <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-5 py-2 border-b border-gray-100">
                  <span className="w-4.5" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t('categories.name')}</span>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Icon</span>
                  <span className="w-7" />
                </div>
                <div className="divide-y divide-gray-200">
                  {orderedCategories.map((cat) => (
                    <SortableCategoryItem key={cat.id} cat={cat} shopId={shopId!} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </GlassCard>
      </div>

      {showModal && (
        <CreateCategoryModal
          shopId={shopId!}
          existingCount={orderedCategories.length}
          onClose={closeModal}
        />
      )}
    </>
  );
}
