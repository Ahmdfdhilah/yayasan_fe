import React from 'react';
import { RPPSubmissionResponse, RPPSubmissionStatus } from '@/services/rpp-submissions/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { 
  FileText, 
  BarChart3,
} from 'lucide-react';
import { rppSubmissionService } from '@/services';

interface RPPSubmissionCardsProps {
  submissions: RPPSubmissionResponse[];
  loading: boolean;
  onView: (submission: RPPSubmissionResponse) => void;
  onSubmit?: (submission: RPPSubmissionResponse) => void;
  onEdit?: (submission: RPPSubmissionResponse) => void;
  onDelete?: (submission: RPPSubmissionResponse) => void;
  userRole: 'guru' | 'admin' | 'kepala_sekolah';
}

export const RPPSubmissionCards: React.FC<RPPSubmissionCardsProps> = ({
  submissions,
  loading,
  onView,
  onSubmit,
  onEdit,
  onDelete,
  userRole
}) => {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat submission RPP...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada submission RPP ditemukan
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Icon and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{submission.teacher_name || 'Tidak ada guru'}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    {submission.teacher_position || 'Jabatan tidak tersedia'}
                  </div>
                </div>
              </div>
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
            </div>

            <div className="space-y-2">
              {/* School */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Sekolah: {submission.organization_name || 'Tidak tersedia'}</span>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Status: {rppSubmissionService.getStatusDisplayName(submission.status)}</span>
              </div>

              {/* Progress */}
              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span>Progress</span>
                    <span>{submission.completion_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${submission.completion_percentage}%` }}
                    ></div>
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