import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';
import { RPPSubmissionResponse, RPPSubmissionStatus } from '@/services/rpp-submissions/types';
import { rppSubmissionService } from '@/services';

interface RPPSubmissionOverviewProps {
  submission: RPPSubmissionResponse;
}

export const RPPSubmissionOverview: React.FC<RPPSubmissionOverviewProps> = ({
  submission
}) => {
  const getStatusIcon = (status: RPPSubmissionStatus) => {
    switch (status) {
      case RPPSubmissionStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case RPPSubmissionStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case RPPSubmissionStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RPPSubmissionStatus) => {
    return rppSubmissionService.getStatusColor(status);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Status Submission</CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon(submission.status)}
            <Badge variant="outline" className={`text-${getStatusColor(submission.status)}-600`}>
              {rppSubmissionService.getStatusDisplayName(submission.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section - Always Full Width on Mobile */}
        <div className="space-y-2">
          <Label>Progress</Label>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${submission.completion_percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {submission.completion_percentage.toFixed(1)}% Complete
              </p>
              <p className="text-xs text-gray-500">
                {submission.completion_percentage === 100 ? 'Siap untuk submit' : 'Masih dalam progress'}
              </p>
            </div>
          </div>
        </div>

        {/* Dates Section - Responsive Grid */}
        {(submission.submitted_at || submission.reviewed_at) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {submission.submitted_at && (
              <div className="space-y-1">
                <Label className="text-sm font-medium">Tanggal Submit</Label>
                <p className="text-sm text-gray-600 break-words">
                  {new Date(submission.submitted_at).toLocaleString('id-ID', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {submission.reviewed_at && (
              <div className="space-y-1">
                <Label className="text-sm font-medium">Tanggal Review</Label>
                <p className="text-sm text-gray-600 break-words">
                  {new Date(submission.reviewed_at).toLocaleString('id-ID', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Review Notes Section */}
        {submission.review_notes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Catatan Review</Label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {submission.review_notes}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};