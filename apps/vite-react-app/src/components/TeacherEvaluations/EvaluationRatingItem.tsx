import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { Label } from '@workspace/ui/components/label';
import { EvaluationAspect } from '@/services/evaluation-aspects/types';
import { EVALUATION_RATINGS } from '@/lib/constants';

interface EvaluationRatingItemProps {
  aspect: EvaluationAspect;
  control?: Control<any>;
  name: string;
  questionNumber: number;
  disabled?: boolean;
  value?: string;
}

export const EvaluationRatingItem: React.FC<EvaluationRatingItemProps> = ({
  aspect,
  control,
  name,
  questionNumber,
  disabled = false,
  value,
}) => {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      {/* Question Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {questionNumber}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">
            {aspect.aspect_name}
          </h3>
          {aspect.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {aspect.description}
            </p>
          )}
        </div>
      </div>

      {/* Rating Options */}
      <div className="ml-12">
        {(disabled && value) || !control ? (
          // Read-only display for completed evaluations
          <div className="space-y-2">
            {EVALUATION_RATINGS.map((rating) => (
              <div
                key={rating.value}
                className={`flex items-center space-x-3 p-3 rounded-md border ${
                  value === rating.value
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/30'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 ${
                  value === rating.value
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}>
                  {value === rating.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className={`text-sm ${
                  value === rating.value ? 'font-medium' : ''
                }`}>
                  {rating.label} - {rating.description} ({rating.score})
                </span>
              </div>
            ))}
          </div>
        ) : control ? (
          // Interactive rating selection
          <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                {EVALUATION_RATINGS.map((rating) => (
                  <div
                    key={rating.value}
                    className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors ${
                      field.value === rating.value
                        ? 'bg-primary/10 border-primary'
                        : 'border-border'
                    }`}
                    onClick={() => !disabled && field.onChange(rating.value)}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      field.value === rating.value
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {field.value === rating.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <Label
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {rating.label} - {rating.description} ({rating.score})
                    </Label>
                  </div>
                ))}
                {error && (
                  <p className="text-sm text-destructive mt-1">
                    {error.message}
                  </p>
                )}
              </div>
            )}
          />
        ) : null}
      </div>
    </div>
  );
};

export default EvaluationRatingItem;