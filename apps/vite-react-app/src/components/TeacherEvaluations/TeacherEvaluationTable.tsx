import React from 'react';
import { TeacherEvaluationResponse } from '@/services/teacher-evaluations/types';
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
  userRole: UserRole;
}

export const TeacherEvaluationTable: React.FC<TeacherEvaluationTableProps> = ({
  evaluations,
  loading = false,
  onView,
  onEvaluate,
  userRole
}) => {

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guru</TableHead>
              <TableHead>Evaluator</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Total Aspek</TableHead>
              <TableHead>Rata-rata Skor</TableHead>
              <TableHead>Nilai Final</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
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
            <TableHead>Evaluator</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead>Total Aspek</TableHead>
            <TableHead>Rata-rata Skor</TableHead>
            <TableHead>Nilai Final</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
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
                  {evaluation.evaluator?.full_name || 'N/A'}
                </TableCell>
                <TableCell>
                  {evaluation.period ?
                    `${evaluation.period.academic_year} - ${evaluation.period.semester}` :
                    'N/A'
                  }
                </TableCell>
                <TableCell>
                  <div className="text-center">{evaluation.items?.length || 0}</div>
                </TableCell>
                <TableCell>
                  <div className="text-center">{evaluation.average_score.toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <div className="text-center">{evaluation.final_grade.toFixed(1)}</div>
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