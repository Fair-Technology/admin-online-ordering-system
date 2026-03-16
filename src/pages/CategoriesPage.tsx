import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { GripVertical, Star } from 'lucide-react';
import {
  useGetCategoriesByShopQuery,
  useUpdateCategoryMutation,
} from '../services/api';
import type { GetCategoriesByShopApiResponse } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { glassButtonClass } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';

type Category = NonNullable<GetCategoriesByShopApiResponse>[number];

interface SortableCategoryItemProps {
  cat: Category;
  shopId: string;
}

function SortableCategoryItem({ cat, shopId }: SortableCategoryItemProps) {
  const { t } = useTranslation();
  const [updateCategory, { isLoading: isToggling }] = useUpdateCategoryMutation();
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

  const handleStarToggle = async () => {
    await updateCategory({
      shopId,
      categoryId: cat.id!,
      updateCategoryRequest: { hasStar: !cat.hasStar },
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing touch-none"
          aria-label={t('categories.dragHandle')}
          type="button"
        >
          <GripVertical size={18} />
        </button>
        <p className="font-medium text-white">{cat.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isToggling}
          onClick={handleStarToggle}
          aria-label={t('categories.hasStar')}
          className={`p-1.5 rounded transition-colors ${cat.hasStar ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/20 hover:text-white/50'}`}
        >
          <Star size={16} fill={cat.hasStar ? 'currentColor' : 'none'} />
        </button>
        <Link
          to={`/shops/${shopId}/categories/${cat.id}/edit`}
          className={glassButtonClass('secondary', 'sm')}
        >
          {t('categories.edit')}
        </Link>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useGetCategoriesByShopQuery({ shopId: shopId! });
  const [updateCategory] = useUpdateCategoryMutation();

  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [reorderError, setReorderError] = useState(false);
  // Prevents a concurrent categories refetch from overwriting an optimistic update
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
          }).unwrap()
        )
      );
    } catch {
      setOrderedCategories(snapshot);
      setReorderError(true);
    } finally {
      isReordering.current = false;
    }
  };

  if (isLoading) return <GlassSpinner label={t('categories.loading')} />;
  if (isError) return <p className="text-red-400">{t('categories.loadError')}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to={`/shops/${shopId}/categories/new`} className={glassButtonClass()}>
          {t('categories.addCategory')}
        </Link>
      </div>

      {reorderError && (
        <GlassCard className="p-4 !bg-red-500/15 !border-red-400/30">
          <p className="text-sm text-red-300">{t('categories.failedToReorder')}</p>
        </GlassCard>
      )}

      <GlassCard>
        {orderedCategories.length === 0 && !isLoading && (
          <p className="p-5 text-white/40 text-sm">{t('categories.empty')}</p>
        )}
        {orderedCategories.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedCategories.map((c) => c.id!)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-white/8">
                {orderedCategories.map((cat) => (
                  <SortableCategoryItem key={cat.id} cat={cat} shopId={shopId!} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </GlassCard>
    </div>
  );
}
