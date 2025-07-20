import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { useToast } from '@workspace/ui/components/sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  PeriodeEvaluasiResponse,
  PeriodeEvaluasiCreate,
  PeriodeEvaluasiUpdate
} from '@/services/periodeEvaluasi/types';
import { periodeEvaluasiService } from '@/services/periodeEvaluasi';

interface PeriodeManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

const PeriodeManagementDialog: React.FC<PeriodeManagementDialogProps> = ({
  open,
  onOpenChange,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [periodeList, setPeriodeList] = useState<PeriodeEvaluasiResponse[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeEvaluasiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<{
    tahun: string;
    status: 'aktif' | 'tutup';
    is_locked: boolean;
  }>({
    tahun: '',
    status: 'aktif',
    is_locked: false,
  });

  // Fetch periode list
  const fetchPeriodeList = async () => {
    try {
      const response = await periodeEvaluasiService.getPeriodeEvaluasi({
        size: 100, // Get all periods
        include_statistics: true,
      });
      setPeriodeList(response.items);
    } catch (error) {
      console.error('Failed to fetch periode list:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data periode evaluasi.',
        variant: 'destructive',
      });
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      fetchPeriodeList();
      resetForm();
    }
  }, [open]);

  // Reset form
  const resetForm = () => {
    setFormData({
      tahun: '',
      status: 'aktif',
      is_locked: false,
    });
    setSelectedPeriode(null);
    setMode('view');
    setShowDeleteDialog(false);
  };

  // Handle period selection
  const handlePeriodeSelect = (periodeId: string) => {
    const periode = periodeList.find(p => p.id === periodeId);
    if (periode) {
      setSelectedPeriode(periode);
      setFormData({
        tahun: periode.tahun.toString(),
        status: periode.status,
        is_locked: periode.is_locked,
      });
      setMode('edit');
    }
  };

  // Handle create new period
  const handleCreatePeriode = async () => {
    if (!formData.tahun) {
      toast({
        title: 'Error',
        description: 'Tahun periode harus diisi.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const createData: PeriodeEvaluasiCreate = {
        tahun: parseInt(formData.tahun),
        status: formData.status,
      };

      const response = await periodeEvaluasiService.createPeriodeEvaluasi(createData);

      toast({
        title: 'Berhasil',
        description: `Periode ${formData.tahun} berhasil dibuat. ${response.bulk_generation_summary.generated_penilaian} penilaian risiko telah dibuat.`,
        variant: 'default',
      });

      await fetchPeriodeList();
      resetForm();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat periode evaluasi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update period
  const handleUpdatePeriode = async () => {
    if (!selectedPeriode) return;

    setIsLoading(true);
    try {
      const updateData: PeriodeEvaluasiUpdate = {
        is_locked: formData.is_locked,
      };

      await periodeEvaluasiService.updatePeriodeEvaluasi(selectedPeriode.id, updateData);

      toast({
        title: 'Berhasil',
        description: `Periode ${selectedPeriode.tahun} berhasil diperbarui.`,
        variant: 'default',
      });

      await fetchPeriodeList();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui periode evaluasi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete period
  const handleDeletePeriode = async () => {
    if (!selectedPeriode) return;


    setIsLoading(true);
    try {
      await periodeEvaluasiService.deletePeriodeEvaluasi(selectedPeriode.id);

      toast({
        title: 'Berhasil',
        description: `Periode ${selectedPeriode.tahun} berhasil dihapus.`,
        variant: 'default',
      });

      await fetchPeriodeList();
      resetForm();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus periode evaluasi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
    setShowDeleteDialog(false);
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manajemen Periode Evaluasi</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Period Selection */}
            <div className="space-y-2">
              <Label>Pilih Periode</Label>
              <Select
                value={selectedPeriode?.id || ''}
                onValueChange={handlePeriodeSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode untuk diedit" />
                </SelectTrigger>
                <SelectContent>
                  {periodeList.map(periode => (
                    <SelectItem key={periode.id} value={periode.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>Tahun {periode.tahun}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Fields */}
            {(mode === 'create' || mode === 'edit') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tahun">Tahun</Label>
                  <Input
                    id="tahun"
                    type="number"
                    placeholder="2024"
                    value={formData.tahun}
                    onChange={(e) => setFormData(prev => ({ ...prev, tahun: e.target.value }))}
                    disabled={mode === 'edit'}
                  />
                </div>

                {mode === 'create' && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'aktif' | 'tutup') =>
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="tutup">Tutup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Lock Switch (only in edit mode) */}
            {mode === 'edit' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_locked"
                  checked={formData.is_locked}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, is_locked: checked }))
                  }
                />
                <Label htmlFor="is_locked">Kunci Periode</Label>
                <span className="text-sm text-muted-foreground">
                  (Periode terkunci tidak dapat diedit)
                </span>
              </div>
            )}

            {/* Period Statistics (only in edit mode) */}
            {mode === 'edit' && selectedPeriode && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Statistik Periode</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Penilaian:</span>
                    <span className="ml-2 font-medium">{selectedPeriode.total_penilaian}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Selesai:</span>
                    <span className="ml-2 font-medium">{selectedPeriode.penilaian_completed}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Tingkat Penyelesaian:</span>
                    <span className="ml-2 font-medium">{selectedPeriode.completion_rate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="flex space-x-2">
                {mode === 'edit' && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setMode('view');
                  }}
                >
                  {mode === 'view' ? 'Tutup' : 'Batal'}
                </Button>

                {mode === 'view' && (
                  <Button
                    onClick={() => setMode('create')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Periode Baru
                  </Button>
                )}

                {mode === 'create' && (
                  <Button
                    onClick={handleCreatePeriode}
                    disabled={isLoading}
                  >
                    Buat Periode
                  </Button>
                )}

                {mode === 'edit' && (
                  <Button
                    onClick={handleUpdatePeriode}
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Perbarui
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Periode</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus periode {selectedPeriode?.tahun}?
              Semua data penilaian risiko akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePeriode}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PeriodeManagementDialog;