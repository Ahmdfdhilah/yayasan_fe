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
  onDeleteAspect: (aspectId: number) => void;
  editingAspectId: number | null;
  newAspectCategory: string | null;
  onCancelEdit: () => void;
  loading?: boolean;
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
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const isAddingToThisCategory = newAspectCategory === category;
  const categoryAspects = aspects.filter(aspect => aspect.category === category);

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                {category}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({categoryAspects.length} aspek)
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddAspect(category);
                }}
                disabled={loading || isAddingToThisCategory}
              >
                <Plus className="h-3 w-3 mr-1" />
                Tambah Aspek
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {isAddingToThisCategory && (
              <AspectFormItem
                categories={categories}
                isEditing={true}
                onEdit={() => {}}
                onCancel={onCancelEdit}
                onSave={(data) => onSaveAspect(null, data)}
                loading={loading}
                defaultCategory={category}
              />
            )}

            {categoryAspects.length === 0 && !isAddingToThisCategory ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Belum ada aspek evaluasi dalam kategori ini
              </div>
            ) : (
              <div className="space-y-2">
                {categoryAspects.map((aspect) => (
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
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};