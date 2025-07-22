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
  periods: Period[];
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

const GenerateRPPDialog: React.FC<GenerateRPPDialogProps> = ({
  periods,
  onSuccess,
  triggerButton
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSubmissions = async () => {
    if (!selectedPeriod) {
      toast({
        title: 'Error',
        description: 'Pilih periode terlebih dahulu.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await rppSubmissionService.generateSubmissionsForPeriod({
        period_id: Number(selectedPeriod)
      });

      toast({
        title: 'Berhasil Membuat RPP Submissions',
        description: `${result.generated_count} submissions berhasil dibuat, ${result.skipped_count} sudah ada sebelumnya. Total guru: ${result.total_teachers}`,
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog and reset
      setIsOpen(false);
      setSelectedPeriod('');
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
    if (!open) {
      setSelectedPeriod('');
    }
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
            Pilih periode untuk membuat RPP submissions untuk semua guru. 
            Sistem akan membuat template RPP kosong yang dapat diisi oleh masing-masing guru.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="period-generate">Periode</Label>
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger id="period-generate">
                <SelectValue placeholder="Pilih periode untuk membuat RPP submissions" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.academic_year} - {period.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            disabled={!selectedPeriod || isGenerating}
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