import React from 'react';
import { RPPSubmissionResponse, RPPSubmissionStatus } from '@/services/rpp-submissions/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';
import { rppSubmissionService } from '@/services';

interface RPPSubmissionTableProps {
  submissions: RPPSubmissionResponse[];
  loading: boolean;
  onView: (submission: RPPSubmissionResponse) => void;
  onSubmit?: (submission: RPPSubmissionResponse) => void;
  onEdit?: (submission: RPPSubmissionResponse) => void;
  onDelete?: (submission: RPPSubmissionResponse) => void;
  userRole: 'guru' | 'admin' | 'kepala_sekolah';
}

export const RPPSubmissionTable: React.FC<RPPSubmissionTableProps> = ({
  submissions,
  loading,
  onView,
  onSubmit,
  onEdit,
  onDelete,
  userRole
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guru</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Sekolah</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Progress</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Memuat submission RPP...
              </TableCell>
            </TableRow>
          ) : submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Tidak ada submission RPP ditemukan
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  {submission.teacher_name || '-'}
                </TableCell>
                <TableCell>
                  {submission.teacher_position || '-'}
                </TableCell>
                <TableCell>
                  {submission.organization_name || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {rppSubmissionService.getStatusDisplayName(submission.status)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-24 mx-auto">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${submission.completion_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {submission.completion_percentage.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <ActionDropdown
                    onView={() => onView(submission)}
                    onEdit={onEdit ? () => onEdit(submission) : undefined}
                    onDelete={onDelete ? () => onDelete(submission) : undefined}
                    showEdit={userRole === 'guru' && submission.status === RPPSubmissionStatus.DRAFT}
                    showDelete={userRole === 'guru' && submission.status === RPPSubmissionStatus.DRAFT}
                    customActions={
                      userRole === 'guru' &&
                        onSubmit &&
                        rppSubmissionService.isSubmissionReady(submission) &&
                        submission.status === RPPSubmissionStatus.DRAFT
                        ? [{
                          label: 'Kirim',
                          onClick: () => onSubmit(submission),
                          icon: 'Send'
                        }]
                        : []
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};