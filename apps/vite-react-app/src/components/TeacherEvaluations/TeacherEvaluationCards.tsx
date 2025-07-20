import React from 'react';
import { TeacherEvaluation, TeacherEvaluationStatus } from '@/services/teacher-evaluations/types';
import { UserRole } from '@/lib/constants';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  User, 
  Calendar,
  GraduationCap,
  Star,
  Clock
} from 'lucide-react';

interface TeacherEvaluationCardsProps {
  evaluations: TeacherEvaluation[];
  loading?: boolean;
  onView: (evaluation: TeacherEvaluation) => void;
  onEvaluate?: (evaluation: TeacherEvaluation) => void;
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

  const getStatusBadge = (status: TeacherEvaluationStatus) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      in_progress: { label: 'Berlangsung', variant: 'default' as const },
      completed: { label: 'Selesai', variant: 'outline' as const },
      draft: { label: 'Draft', variant: 'secondary' as const }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;
    
    const gradeConfig = {
      A: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      B: { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
      C: { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800' },
      D: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };

    const config = gradeConfig[grade as keyof typeof gradeConfig];
    return (
      <Badge variant={config?.variant || 'outline'} className={config?.className}>
        {grade}
      </Badge>
    );
  };

  const getActionProps = (evaluation: TeacherEvaluation) => {
    const canEvaluate = userRole !== 'guru' && 
                       evaluation.status !== 'completed' && 
                       onEvaluate;

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
                  <span className="font-medium truncate">{evaluation.teacher.display_name}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{evaluation.teacher.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusBadge(evaluation.status)}
                <ActionDropdown {...getActionProps(evaluation)} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {evaluation.period.academic_year} - {evaluation.period.semester}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDate(evaluation.period.start_date)} - {formatDate(evaluation.period.end_date)}
                </span>
              </div>

              {userRole === 'admin' && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>Evaluator: {evaluation.evaluator.display_name}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {evaluation.total_score ? (
                        <span className="font-medium">{evaluation.total_score.toFixed(1)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </span>
                  </div>
                  
                  {evaluation.final_grade && (
                    <div className="flex items-center gap-2">
                      {getGradeBadge(evaluation.final_grade)}
                    </div>
                  )}
                </div>

                {evaluation.submitted_at && (
                  <div className="text-xs text-muted-foreground">
                    Submit: {formatDate(evaluation.submitted_at)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};