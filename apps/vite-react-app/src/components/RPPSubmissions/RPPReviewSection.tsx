import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@workspace/ui/components/alert-dialog';
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
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

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
        [RPPSubmissionStatus.APPROVED]: 'Submission berhasil disetujui.',
        [RPPSubmissionStatus.REJECTED]: 'Submission berhasil ditolak.',
      };

      toast({
        title: 'Berhasil',
        description: statusMessages[status] || 'Review berhasil disimpan.',
      });

      // Close dialogs
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);

      onReviewComplete();
    } catch (error: any) {
      console.error('Error reviewing submission:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal mereview submission.',
        variant: 'destructive'
      });
      // Close dialogs on error too
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
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
            {/* Approve Dialog */}
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
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
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menyetujui Submission ini? Setelah disetujui, status submission akan berubah menjadi "Approved" dan guru akan mendapat notifikasi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleReview(RPPSubmissionStatus.APPROVED)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Setujui
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={reviewing || !reviewNotes.trim()}
                  variant="destructive"
                >
                  {reviewing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Tolak
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menolak Submission ini? Setelah ditolak, guru dapat memperbaiki dan submit ulang submission mereka. Pastikan Anda telah memberikan catatan review yang jelas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleReview(RPPSubmissionStatus.REJECTED)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Tolak
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};