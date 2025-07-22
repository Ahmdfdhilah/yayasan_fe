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
import { Users, RotateCcw } from 'lucide-react';
import { Period } from '@/services/periods/types';
import { teacherEvaluationService } from '@/services';

interface AssignTeachersToPeriodDialogProps {
  periods: Period[];
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

const AssignTeachersToPeriodDialog: React.FC<AssignTeachersToPeriodDialogProps> = ({
  periods,
  onSuccess,
  triggerButton
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignTeachers = async () => {
    if (!selectedPeriod) {
      toast({
        title: 'Error',
        description: 'Pilih periode terlebih dahulu.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsAssigning(true);
      const result = await teacherEvaluationService.assignTeachersToPeriod({
        period_id: Number(selectedPeriod)
      });

      if (result.errors && result.errors.length > 0) {
        toast({
          title: 'Penetapan Guru Selesai dengan Peringatan',
          description: `${result.created_count} evaluasi berhasil dibuat. ${result.errors.length} error: ${result.errors.join(', ')}`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Berhasil Menetapkan Guru',
          description: `${result.created_count} evaluasi guru berhasil dibuat untuk periode ini.`,
        });
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog and reset
      setIsOpen(false);
      setSelectedPeriod('');
    } catch (error: any) {
      console.error('Error assigning teachers to period:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal menetapkan guru ke periode. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setIsAssigning(false);
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
      <Users className="h-4 w-4 mr-2" />
      Tetapkan Guru ke Periode
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || defaultTriggerButton}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tetapkan Guru ke Periode</DialogTitle>
          <DialogDescription>
            Pilih periode untuk membuat evaluasi kosong untuk semua guru. 
            Sistem akan otomatis membuat formulir evaluasi untuk semua guru aktif dalam periode tersebut.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="period-assign">Periode</Label>
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger id="period-assign">
                <SelectValue placeholder="Pilih periode untuk tetapkan guru" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.academic_year} - {period.semester}
                    {period.is_active && ' (Aktif)'}
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
            disabled={isAssigning}
          >
            Batal
          </Button>
          <Button
            onClick={handleAssignTeachers}
            disabled={!selectedPeriod || isAssigning}
          >
            {isAssigning ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Menetapkan...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Tetapkan Guru
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeachersToPeriodDialog;