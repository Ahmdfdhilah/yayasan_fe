import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { EvaluationAspect, EvaluationAspectCreate, EvaluationAspectUpdate, EvaluationCategory, CategoryWithAspectsResponse } from '@/services/evaluation-aspects/types';
import { AspectFormItem } from './AspectFormItem';
import { Plus, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

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
}

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
}) => {
  const isAddingToThisCategory = newAspectCategoryId === category.id;
  const categoryAspects = aspects;

  return (
    <div className="bg-card rounded-lg border overflow-hidden group">
      {/* Section Header - Google Forms style */}
      <div className="border-l-4 border-primary bg-muted/50 px-4 sm:px-6 py-4 relative">
        {/* Drag Handle for Edit Mode */}
        {isEditMode && (
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
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
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              Belum ada pertanyaan dalam bagian ini
            </p>
            {isEditMode && (
              <Button
                onClick={() => onAddAspect(category.id)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pertanyaan Pertama
              </Button>
            )}
          </div>
        ) : (
          isEditMode ? (
            /* Drag & Drop for aspects in edit mode */
            <Reorder.Group
              axis="y"
              values={categoryAspects}
              onReorder={() => {
                // Update aspects order in parent
                // TODO: Implement aspect reordering within category
              }}
              className="space-y-4"
            >
              {categoryAspects.map((aspect, index) => (
                <Reorder.Item
                  key={aspect.id}
                  value={aspect}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
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
                    />
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
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