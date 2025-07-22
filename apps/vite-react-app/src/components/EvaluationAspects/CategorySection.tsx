import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { EvaluationAspect, EvaluationAspectCreate, EvaluationAspectUpdate, EvaluationCategory, CategoryWithAspectsResponse } from '@/services/evaluation-aspects/types';
import { AspectFormItem } from './AspectFormItem';
import { Plus } from 'lucide-react';

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
}) => {
  const isAddingToThisCategory = newAspectCategoryId === category.id;
  const categoryAspects = aspects;

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Section Header - Google Forms style */}
      <div className="border-l-4 border-primary bg-muted/50 px-4 sm:px-6 py-4">
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
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        {isAddingToThisCategory && (
          <div className="mb-6">
            <AspectFormItem
              categories={categories}
              isEditing={true}
              onEdit={() => {}}
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
            <Button
              onClick={() => onAddAspect(category.id)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pertanyaan Pertama
            </Button>
          </div>
        ) : (
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};