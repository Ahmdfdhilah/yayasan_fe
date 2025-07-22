import React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import {
  EvaluationAspect,
  EvaluationAspectCreate,
  EvaluationAspectUpdate,
  EvaluationCategory
  , EvaluationCategoryUpdate,
  CategoryWithAspectsResponse
} from '@/services/evaluation-aspects/types';
import { AspectFormItem } from './AspectFormItem';
import { Plus, GripVertical, Edit, Check, X, Trash2 } from 'lucide-react';
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
  onUpdateCategory?: (categoryId: number, data: EvaluationCategoryUpdate) => Promise<void>;
  onDeleteCategory?: (categoryId: number) => Promise<void>;
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
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const isAddingToThisCategory = newAspectCategoryId === category.id;
  const categoryAspects = aspects;

  // Category editing state
  const [isEditingCategory, setIsEditingCategory] = React.useState(false);
  const [editedCategoryName, setEditedCategoryName] = React.useState(category.name);
  const [editedCategoryDescription, setEditedCategoryDescription] = React.useState(category.description || '');
  const [isSavingCategory, setIsSavingCategory] = React.useState(false);

  // Category deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = React.useState(false);

  // Update local state when category changes
  React.useEffect(() => {
    setEditedCategoryName(category.name);
    setEditedCategoryDescription(category.description || '');
  }, [category.name, category.description]);

  // Handle category edit
  const handleEditCategory = () => {
    setIsEditingCategory(true);
  };

  // Handle cancel category edit
  const handleCancelCategoryEdit = () => {
    setIsEditingCategory(false);
    setEditedCategoryName(category.name);
    setEditedCategoryDescription(category.description || '');
  };

  // Handle save category
  const handleSaveCategory = async () => {
    if (!onUpdateCategory || !editedCategoryName.trim()) return;

    try {
      setIsSavingCategory(true);

      await onUpdateCategory(category.id, {
        name: editedCategoryName.trim(),
        description: editedCategoryDescription.trim() || undefined
      });

      setIsEditingCategory(false);
    } catch (error) {
      console.error('Error updating category:', error);
      // Error handling will be done by parent component
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    setShowDeleteConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!onDeleteCategory) return;

    try {
      setIsDeletingCategory(true);
      await onDeleteCategory(category.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting category:', error);
      // Error handling will be done by parent component
    } finally {
      setIsDeletingCategory(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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

            {isEditingCategory ? (
              /* Category Edit Form */
              <div className="mt-2 space-y-3">
                <input
                  type="text"
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  className="text-lg sm:text-xl font-medium bg-transparent border-none outline-none focus:ring-0 p-0 w-full placeholder-muted-foreground border-b-2 border-primary/30 focus:border-primary"
                  placeholder="Nama bagian"
                  disabled={isSavingCategory}
                />
                <textarea
                  value={editedCategoryDescription}
                  onChange={(e) => setEditedCategoryDescription(e.target.value)}
                  className="text-sm text-muted-foreground bg-transparent border-none outline-none focus:ring-0 p-0 w-full resize-none placeholder-muted-foreground border-b border-muted focus:border-primary"
                  placeholder="Deskripsi bagian (opsional)"
                  rows={2}
                  disabled={isSavingCategory}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveCategory}
                    disabled={isSavingCategory || !editedCategoryName.trim()}
                    size="sm"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {isSavingCategory ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button
                    onClick={handleCancelCategoryEdit}
                    disabled={isSavingCategory}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              /* Category Display */
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-medium break-words">
                    {category.name}
                  </h2>
                  {isEditMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onUpdateCategory && (
                        <Button
                          onClick={handleEditCategory}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {onDeleteCategory && categoryAspects.length === 0 && (
                        <Button
                          onClick={handleDeleteCategory}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
              </div>
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

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Bagian</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus bagian "{category.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowDeleteConfirm(false)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingCategory ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};