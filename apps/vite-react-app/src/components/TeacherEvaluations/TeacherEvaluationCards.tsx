import React from 'react';
import { TeacherEvaluationResponse } from '@/services/teacher-evaluations/types';
import { UserRole } from '@/lib/constants';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  User, 
  Calendar,
  GraduationCap,
  Star,
  BarChart3,
} from 'lucide-react';

interface TeacherEvaluationCardsProps {
  evaluations: TeacherEvaluationResponse[];
  loading?: boolean;
  onView: (evaluation: TeacherEvaluationResponse) => void;
  onEvaluate?: (evaluation: TeacherEvaluationResponse) => void;
  userRole: UserRole;
}

export const TeacherEvaluationCards: React.FC<TeacherEvaluationCardsProps> = ({
  evaluations,
  loading = false,
  onView,
  onEvaluate,
  userRole
}) => {
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };


  const getActionProps = (evaluation: TeacherEvaluationResponse) => {
    const canEvaluate = userRole !== 'guru' && !!onEvaluate;

    return {
      onView: () => onView(evaluation),
      onEdit: canEvaluate ? () => onEvaluate!(evaluation) : undefined,
      showView: true,
      showEdit: canEvaluate,
      showDelete: false
    };
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Tidak ada data evaluasi guru.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {evaluations.map((evaluation) => (
        <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{evaluation.teacher?.full_name || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ActionDropdown {...getActionProps(evaluation)} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {evaluation.period ? 
                    `${evaluation.period.academic_year} - ${evaluation.period.semester}` : 
                    'N/A'
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>
                  Total Aspek: {evaluation.items?.length || 0}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Evaluator: {evaluation.evaluator?.full_name || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Rata-rata: <span className="font-medium">{evaluation.average_score.toFixed(2)}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nilai: {evaluation.final_grade.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};