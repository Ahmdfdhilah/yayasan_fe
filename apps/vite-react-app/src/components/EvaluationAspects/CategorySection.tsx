import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { EvaluationAspect, EvaluationAspectCreate, EvaluationAspectUpdate, EvaluationCategory, CategoryWithAspectsResponse } from '@/services/evaluation-aspects/types';
import { AspectFormItem } from './AspectFormItem';
import { Plus, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

interface CategorySectionProps {
  category: CategoryWithAspectsResponse;
  aspects: EvaluationAspect[];
  categories: EvaluationCategory[];
  onAddAspect: (categoryId: number) => void;
  onEditAspect: (aspect: EvaluationAspect) => void;
  onSaveAspect: (aspectId: number | null, data: EvaluationAspectCreate | EvaluationAspectUpdate) => void;
  onDeleteAspect: (aspect: EvaluationAspect) => void;
  editingAspectId: number | null;
  newAspectCategoryId: number | null;
  onCancelEdit: () => void;
  loading?: boolean;
  sectionNumber?: number;
  isEditMode?: boolean;
  onAspectReorder?: (aspectId: number, newOrder: number) => Promise<void>;
}

// Category drag handle component
const CategoryDragHandle: React.FC<{ categoryId: number }> = ({ categoryId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoryId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  aspects,
  categories,
  onAddAspect,
  onEditAspect,
  onSaveAspect,
  onDeleteAspect,
  editingAspectId,
  newAspectCategoryId,
  onCancelEdit,
  loading = false,
  sectionNumber = 1,
  isEditMode = false,
  onAspectReorder,
}) => {
  const isAddingToThisCategory = newAspectCategoryId === category.id;
  const categoryAspects = aspects;
  
  // Drag and drop sensors for aspects
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle aspect drag end within category
  const handleAspectDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onAspectReorder) {
      const newIndex = categoryAspects.findIndex((aspect) => aspect.id === over.id);
      
      await onAspectReorder(active.id as number, newIndex);
    }
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden group">
      {/* Section Header - Google Forms style */}
      <div className="border-l-4 border-primary bg-muted/50 px-4 sm:px-6 py-4 relative">
        {/* Drag Handle for Edit Mode */}
        {isEditMode && (
          <CategoryDragHandle categoryId={category.id} />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-sm text-primary font-medium whitespace-nowrap">
                Bagian {sectionNumber}
              </span>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {categoryAspects.length} pertanyaan
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-medium mt-1 break-words">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
            )}
          </div>
          {/* Only show add button in edit mode */}
          {isEditMode && (
            <div className="flex-shrink-0">
              <Button
                onClick={() => onAddAspect(category.id)}
                disabled={loading || isAddingToThisCategory}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pertanyaan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        {isAddingToThisCategory && (
          <div className="mb-6">
            <AspectFormItem
              categories={categories}
              isEditing={true}
              onEdit={() => { }}
              onCancel={onCancelEdit}
              onSave={(data) => onSaveAspect(null, data)}
              loading={loading}
              defaultCategoryId={category.id}
            />
          </div>
        )}

        {categoryAspects.length === 0 && !isAddingToThisCategory ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-sm">
              Belum ada pertanyaan dalam bagian ini
            </p>
          </div>
        ) : (
          isEditMode ? (
            /* Drag & Drop for aspects in edit mode with @dnd-kit */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleAspectDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={categoryAspects.map(aspect => aspect.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {categoryAspects.map((aspect, index) => (
                    <AspectFormItem
                      key={aspect.id}
                      aspect={aspect}
                      categories={categories}
                      isEditing={editingAspectId === aspect.id}
                      onEdit={() => onEditAspect(aspect)}
                      onCancel={onCancelEdit}
                      onSave={(data) => onSaveAspect(aspect.id, data)}
                      onDelete={onDeleteAspect}
                      loading={loading}
                      questionNumber={index + 1}
                      isEditMode={isEditMode}
                      isDragMode={true}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            /* Static view in view mode */
            <div className="space-y-4">
              {categoryAspects.map((aspect, index) => (
                <motion.div
                  key={aspect.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <AspectFormItem
                    key={aspect.id}
                    aspect={aspect}
                    categories={categories}
                    isEditing={false}
                    onEdit={() => onEditAspect(aspect)}
                    onCancel={onCancelEdit}
                    onSave={(data) => onSaveAspect(aspect.id, data)}
                    onDelete={onDeleteAspect}
                    loading={loading}
                    questionNumber={index + 1}
                    isEditMode={isEditMode}
                    isDragMode={false}
                  />
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};