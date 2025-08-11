import React from 'react';
import { TeacherEvaluationResponse } from '@/services/teacher-evaluations/types';
import { formatAverageScore, formatFinalGrade } from '@/services/teacher-evaluations/utils';
import { UserRole } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';

interface TeacherEvaluationTableProps {
  evaluations: TeacherEvaluationResponse[];
  loading?: boolean;
  onView: (evaluation: TeacherEvaluationResponse) => void;
  onEvaluate?: (evaluation: TeacherEvaluationResponse) => void;
  onEdit?: (evaluation: TeacherEvaluationResponse) => void;
  canEdit?: (evaluation: TeacherEvaluationResponse) => boolean;
  userRole: UserRole;
}

export const TeacherEvaluationTable: React.FC<TeacherEvaluationTableProps> = ({
  evaluations,
  loading = false,
  onView,
  onEvaluate,
  onEdit,
  canEdit,
  userRole
}) => {

  const getActionProps = (evaluation: TeacherEvaluationResponse) => {
    const canEvaluateItem = userRole !== 'GURU' && !!onEvaluate;
    const canEditItem = !!onEdit && !!canEdit && canEdit(evaluation);

    return {
      onView: () => onView(evaluation),
      onEdit: canEditItem ? () => onEdit!(evaluation) : undefined,
      onEvaluate: canEvaluateItem ? () => onEvaluate!(evaluation) : undefined,
      showView: true,
      showEdit: canEditItem,
      showEvaluate: canEvaluateItem,
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
              <TableHead>Jabatan</TableHead>
              <TableHead>Sekolah</TableHead>
              <TableHead>Evaluator</TableHead>
              <TableHead className="text-center">Rata-rata Skor</TableHead>
              <TableHead className="text-center">Nilai Final</TableHead>
              <TableHead className="w-[100px] text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
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
            <TableHead>Jabatan</TableHead>
            <TableHead>Sekolah</TableHead>
            <TableHead>Evaluator</TableHead>
            <TableHead className="text-center">Rata-rata Skor</TableHead>
            <TableHead className="text-center">Nilai Final</TableHead>
            <TableHead className="w-[100px] text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data evaluasi guru.
              </TableCell>
            </TableRow>
          ) : (
            evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>
                  {evaluation.teacher?.full_name || 'N/A'}
                </TableCell>
                <TableCell>
                  {evaluation.teacher?.profile?.position || '-'}
                </TableCell>
                <TableCell>
                  {evaluation.organization_name || 'N/A'}
                </TableCell>
                <TableCell>
                  {evaluation.evaluator?.full_name || 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  {formatAverageScore(evaluation.average_score)}
                </TableCell>
                <TableCell className="text-center">
                  {formatFinalGrade(evaluation.final_grade)}
                </TableCell>
                <TableCell className="text-center">
                  <ActionDropdown {...getActionProps(evaluation)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div >
  );
};