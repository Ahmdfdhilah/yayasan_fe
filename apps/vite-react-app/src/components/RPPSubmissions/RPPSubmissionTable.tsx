import React from 'react';
import { RPPSubmissionResponse } from '@/services/rpp-submissions/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
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
            <TableHead>Periode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Tanggal Kirim</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Memuat submission RPP...
              </TableCell>
            </TableRow>
          ) : submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Tidak ada submission RPP ditemukan
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{submission.period_name}</div>
                    {submission.teacher_name && (
                      <div className="text-sm text-muted-foreground">{submission.teacher_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {rppSubmissionService.getStatusDisplayName(submission.status)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
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
                <TableCell>
                  {submission.submitted_at
                    ? format(new Date(submission.submitted_at), 'dd MMM yyyy', { locale: id })
                    : 'Belum dikirim'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(submission)}
                    onEdit={onEdit ? () => onEdit(submission) : undefined}
                    onDelete={onDelete ? () => onDelete(submission) : undefined}
                    showEdit={userRole === 'guru' && submission.status === 'draft'}
                    showDelete={userRole === 'guru' && submission.status === 'draft'}
                    customActions={
                      userRole === 'guru' && 
                      onSubmit && 
                      rppSubmissionService.isSubmissionReady(submission) && 
                      submission.status === 'draft'
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