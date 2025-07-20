import React from 'react';
import { RPPSubmissionResponse } from '@/services/rpp-submissions/types';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Eye, Send, Calendar } from 'lucide-react';
import { rppSubmissionService } from '@/services';

interface RPPSubmissionCardsProps {
  submissions: RPPSubmissionResponse[];
  loading: boolean;
  onView: (submission: RPPSubmissionResponse) => void;
  onSubmit?: (submission: RPPSubmissionResponse) => void;
  userRole: 'guru' | 'admin' | 'kepala_sekolah';
}

export const RPPSubmissionCards: React.FC<RPPSubmissionCardsProps> = ({
  submissions,
  loading,
  onView,
  onSubmit,
  userRole
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
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
    <div className="grid grid-cols-1 gap-4">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{submission.period_name}</CardTitle>
              <Badge 
                variant="outline" 
                className={`text-${rppSubmissionService.getStatusColor(submission.status)}-600`}
              >
                {rppSubmissionService.getStatusDisplayName(submission.status)}
              </Badge>
            </div>
            {submission.teacher_name && (
              <p className="text-sm text-muted-foreground">{submission.teacher_name}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {submission.completion_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${submission.completion_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Submitted Date */}
              {submission.submitted_at && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(submission)}
                  className="flex-1"
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
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};