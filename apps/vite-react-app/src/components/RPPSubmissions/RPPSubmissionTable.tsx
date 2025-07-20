import React from 'react';
import { RPPSubmissionResponse } from '@/services/rpp-submissions/types';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Eye, Send } from 'lucide-react';
import { rppSubmissionService } from '@/services';

interface RPPSubmissionTableProps {
  submissions: RPPSubmissionResponse[];
  loading: boolean;
  onView: (submission: RPPSubmissionResponse) => void;
  onSubmit?: (submission: RPPSubmissionResponse) => void;
  userRole: 'guru' | 'admin' | 'kepala_sekolah';
}

export const RPPSubmissionTable: React.FC<RPPSubmissionTableProps> = ({
  submissions,
  loading,
  onView,
  onSubmit,
  userRole
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Tidak ada RPP submissions yang ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Periode</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Progress</th>
            <th className="text-left p-3 font-medium">Submitted</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div>
                  <div className="font-medium">{submission.period_name}</div>
                  {submission.teacher_name && (
                    <div className="text-sm text-muted-foreground">{submission.teacher_name}</div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <Badge 
                  variant="outline" 
                  className={`text-${rppSubmissionService.getStatusColor(submission.status)}-600`}
                >
                  {rppSubmissionService.getStatusDisplayName(submission.status)}
                </Badge>
              </td>
              <td className="p-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${submission.completion_percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {submission.completion_percentage}%
                </span>
              </td>
              <td className="p-3">
                {submission.submitted_at ? (
                  <span className="text-sm">
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(submission)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {userRole === 'guru' && 
                   onSubmit && 
                   rppSubmissionService.isSubmissionReady(submission) && 
                   submission.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => onSubmit(submission)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Submit
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};