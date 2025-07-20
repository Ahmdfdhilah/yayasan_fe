import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@workspace/ui/components/sonner';
import { 
  RPPSubmissionResponse, 
  RPPSubmissionStatus 
} from '@/services/rpp-submissions/types';
import { rppSubmissionService } from '@/services';

interface RPPReviewSectionProps {
  submission: RPPSubmissionResponse;
  onReviewComplete: () => void;
}

export const RPPReviewSection: React.FC<RPPReviewSectionProps> = ({
  submission,
  onReviewComplete
}) => {
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState(submission.review_notes || '');
  const [reviewing, setReviewing] = useState(false);

  const handleReview = async (status: RPPSubmissionStatus) => {
    try {
      setReviewing(true);
      await rppSubmissionService.reviewSubmission(submission.id, {
        status,
        review_notes: reviewNotes || undefined
      });

      const statusMessages: Record<RPPSubmissionStatus, string> = {
        [RPPSubmissionStatus.DRAFT]: 'Status berhasil diubah ke draft.',
        [RPPSubmissionStatus.PENDING]: 'Status berhasil diubah ke pending.',
        [RPPSubmissionStatus.APPROVED]: 'RPP submission berhasil disetujui.',
        [RPPSubmissionStatus.REJECTED]: 'RPP submission berhasil ditolak.',
      };

      toast({
        title: 'Berhasil',
        description: statusMessages[status] || 'Review berhasil disimpan.',
      });

      onReviewComplete();
    } catch (error: any) {
      console.error('Error reviewing submission:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal mereview RPP submission.',
        variant: 'destructive'
      });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Submission</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="review-notes">Catatan Review</Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Berikan catatan untuk guru..."
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => handleReview(RPPSubmissionStatus.APPROVED)}
              disabled={reviewing}
              className="bg-green-600 hover:bg-green-700"
            >
              {reviewing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Setujui
            </Button>
            <Button
              onClick={() => handleReview(RPPSubmissionStatus.REJECTED)}
              disabled={reviewing}
              variant="destructive"
            >
              {reviewing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Tolak
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};