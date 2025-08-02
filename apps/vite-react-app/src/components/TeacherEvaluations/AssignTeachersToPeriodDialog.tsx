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
import { Label } from '@workspace/ui/components/label';
import { Users, RotateCcw } from 'lucide-react';
import { Period } from '@/services/periods/types';
import { AssignTeachersToEvaluationPeriodResponse } from '@/services/teacher-evaluations/types';
import { teacherEvaluationService } from '@/services';

interface AssignTeachersToPeriodDialogProps {
  activePeriod?: Period | null;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

const AssignTeachersToPeriodDialog: React.FC<AssignTeachersToPeriodDialogProps> = ({
  activePeriod,
  onSuccess,
  triggerButton
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  // No need for selectedPeriod state since we always use activePeriod
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignTeachers = async () => {
    if (!activePeriod) {
      toast({
        title: 'Error',
        description: 'Tidak ada periode aktif yang tersedia.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsAssigning(true);
      const result: AssignTeachersToEvaluationPeriodResponse = await teacherEvaluationService.assignTeachersToPeriod({
        period_id: activePeriod.id
      });

      toast({
        title: result.success ? 'Berhasil Menetapkan Guru' : 'Penetapan Guru Selesai',
        description: result.message || `${result.created_evaluations} evaluasi berhasil dibuat, ${result.skipped_evaluations} sudah ada sebelumnya. Periode: ${result.period_name}`,
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog
      setIsOpen(false);
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
            {activePeriod ? (
              <>
                Membuat evaluasi kosong untuk semua guru di periode aktif: <strong>{activePeriod.academic_year} - {activePeriod.semester}</strong>. 
                Sistem akan otomatis membuat aspek evaluasi untuk semua guru aktif dalam periode tersebut.
              </>
            ) : (
              'Tidak ada periode aktif yang tersedia. Pastikan ada periode yang sedang aktif untuk melakukan penetapan guru.'
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
                  Evaluasi akan otomatis dibuat untuk periode yang sedang aktif
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="font-medium text-destructive">
                Tidak ada periode aktif
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Pastikan ada periode yang sedang aktif untuk melakukan penetapan guru
              </div>
            </div>
          )}
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
            disabled={!activePeriod || isAssigning}
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