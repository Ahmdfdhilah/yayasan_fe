import React, { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { Plus, RotateCcw } from 'lucide-react';
import { Period } from '@/services/periods/types';
import { rppSubmissionService } from '@/services';

interface GenerateRPPDialogProps {
  activePeriod?: Period | null;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

const GenerateRPPDialog: React.FC<GenerateRPPDialogProps> = ({
  activePeriod,
  onSuccess,
  triggerButton
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  // No need for selectedPeriod state since we always use activePeriod
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSubmissions = async () => {
    if (!activePeriod) {
      toast({
        title: 'Error',
        description: 'Tidak ada periode aktif yang tersedia.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await rppSubmissionService.generateSubmissionsForPeriod({
        period_id: activePeriod.id
      });

      toast({
        title: result.success ? 'Berhasil Membuat RPP Submissions' : 'RPP Submissions Selesai',
        description: result.message || `${result.created_evaluations} submissions berhasil dibuat, ${result.skipped_evaluations} sudah ada sebelumnya. Periode: ${result.period_name}`,
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error generating RPP submissions:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal membuat RPP submissions. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const defaultTriggerButton = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Buat RPP untuk Periode
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || defaultTriggerButton}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat RPP Submissions</DialogTitle>
          <DialogDescription>
            {activePeriod ? (
              <>
                Membuat RPP submissions untuk semua guru di periode aktif: <strong>{activePeriod.academic_year} - {activePeriod.semester}</strong>. 
                Sistem akan membuat template RPP kosong yang dapat diisi oleh masing-masing guru.
              </>
            ) : (
              'Tidak ada periode aktif yang tersedia. Pastikan ada periode yang sedang aktif untuk membuat RPP submissions.'
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {activePeriod ? (
            <div className="space-y-2">
              <Label>Periode Aktif</Label>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <div className="font-medium text-primary">
                  {activePeriod.academic_year} - {activePeriod.semester}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  RPP akan otomatis dibuat untuk periode yang sedang aktif
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="font-medium text-destructive">
                Tidak ada periode aktif
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Pastikan ada periode yang sedang aktif untuk membuat RPP submissions
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isGenerating}
          >
            Batal
          </Button>
          <Button
            onClick={handleGenerateSubmissions}
            disabled={!activePeriod || isGenerating}
          >
            {isGenerating ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Membuat...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Buat Submissions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateRPPDialog;