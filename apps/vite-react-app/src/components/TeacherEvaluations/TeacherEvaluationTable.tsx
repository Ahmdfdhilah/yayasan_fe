import React from 'react';
import { TeacherEvaluation } from '@/services/teacher-evaluations/types';
import { UserRole } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface TeacherEvaluationTableProps {
  evaluations: TeacherEvaluation[];
  loading?: boolean;
  onView: (evaluation: TeacherEvaluation) => void;
  onEvaluate?: (evaluation: TeacherEvaluation) => void;
  userRole: UserRole;
}

export const TeacherEvaluationTable: React.FC<TeacherEvaluationTableProps> = ({
  evaluations,
  loading = false,
  onView,
  onEvaluate,
  userRole
}) => {

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };

  const getStatusBadge = (grade?: string) => {
    if (!grade) {
      return (
        <Badge variant="secondary">
          Belum Dinilai
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        Selesai
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guru</TableHead>
              <TableHead>Aspek</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Evaluator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Skor</TableHead>
              <TableHead>Tanggal Evaluasi</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guru</TableHead>
            <TableHead>Aspek</TableHead>
            <TableHead>Periode</TableHead>
            {userRole === 'admin' && <TableHead>Evaluator</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Skor</TableHead>
            <TableHead>Tanggal Evaluasi</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={userRole === 'admin' ? 9 : 8} 
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data evaluasi guru.
              </TableCell>
            </TableRow>
          ) : (
            evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{evaluation.teacher_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{evaluation.teacher_email || ''}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{evaluation.aspect_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{evaluation.aspect_category || ''}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{evaluation.period_name || 'N/A'}</div>
                  </div>
                </TableCell>
                {userRole === 'admin' && (
                  <TableCell>
                    <div className="font-medium">{evaluation.evaluator_name || 'N/A'}</div>
                  </TableCell>
                )}
                <TableCell>
                  {getStatusBadge(evaluation.grade)}
                </TableCell>
                <TableCell>
                  {getGradeBadge(evaluation.grade)}
                </TableCell>
                <TableCell>
                  {evaluation.score ? (
                    <span className="font-medium">{evaluation.score}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {evaluation.evaluation_date ? (
                    formatDate(evaluation.evaluation_date)
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <ActionDropdown {...getActionProps(evaluation)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};