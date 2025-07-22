import React from 'react';
import { Control } from 'react-hook-form';
import { EvaluationAspect } from '@/services/evaluation-aspects/types';
import { EvaluationRatingItem } from './EvaluationRatingItem';

interface EvaluationCategorySectionProps {
  category: string;
  aspects: EvaluationAspect[];
  control?: Control<any>;
  sectionNumber: number;
  disabled?: boolean;
  evaluationData?: Record<string, string>;
}

export const EvaluationCategorySection: React.FC<EvaluationCategorySectionProps> = ({
  category,
  aspects,
  control,
  sectionNumber,
  disabled = false,
  evaluationData,
}) => {
  // Sort aspects by display_order if not already sorted  
  const categoryAspects = aspects
    .filter(aspect => (aspect.category_name) === category)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Section Header - Google Forms style */}
      <div className="border-l-4 border-primary bg-muted/50 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-sm text-primary font-medium whitespace-nowrap">
            Bagian {sectionNumber}
          </span>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            {categoryAspects.length} aspek penilaian
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-medium mt-1 break-words">
          {category}
        </h2>
      </div>

      {/* Section Content */}
      <div className="p-6 space-y-6">
        {categoryAspects.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-sm">
              Tidak ada aspek penilaian dalam bagian ini
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categoryAspects.map((aspect, index) => (
              <EvaluationRatingItem
                key={aspect.id}
                aspect={aspect}
                control={control}
                name={`aspects.${aspect.id}`}
                questionNumber={index + 1}
                disabled={disabled}
                value={evaluationData?.[aspect.id.toString()]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationCategorySection;