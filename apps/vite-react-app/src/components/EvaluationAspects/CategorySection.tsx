import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { EvaluationAspect, EvaluationAspectCreate, EvaluationAspectUpdate } from '@/services/evaluation-aspects/types';
import { AspectFormItem } from './AspectFormItem';

interface CategorySectionProps {
  category: string;
  aspects: EvaluationAspect[];
  categories: string[];
  onAddAspect: (categoryName: string) => void;
  onEditAspect: (aspect: EvaluationAspect) => void;
  onSaveAspect: (aspectId: number | null, data: EvaluationAspectCreate | EvaluationAspectUpdate) => void;
  onDeleteAspect: (aspect: EvaluationAspect) => void;
  editingAspectId: number | null;
  newAspectCategory: string | null;
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
  newAspectCategory,
  onCancelEdit,
  loading = false,
  sectionNumber = 1,
}) => {
  const isAddingToThisCategory = newAspectCategory === category;
  const categoryAspects = aspects.filter(aspect => aspect.category === category);

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Section Header - Google Forms style */}
      <div className="border-l-4 border-primary bg-muted/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary font-medium">
                Bagian {sectionNumber}
              </span>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <span className="text-muted-foreground text-sm">
                {categoryAspects.length} pertanyaan
              </span>
            </div>
            <h2 className="text-xl font-medium mt-1">
              {category}
            </h2>
          </div>
          <Button
            onClick={() => onAddAspect(category)}
            disabled={loading || isAddingToThisCategory}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pertanyaan
          </Button>
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
              defaultCategory={category}
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
              onClick={() => onAddAspect(category)}
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