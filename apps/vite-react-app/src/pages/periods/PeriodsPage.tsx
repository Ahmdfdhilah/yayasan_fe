import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Period, PeriodFilterParams } from '@/services/periods/types';
import { periodService } from '@/services/periods';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { Plus } from 'lucide-react';
import { PeriodTable } from '@/components/Periods/PeriodTable';
import { PeriodCards } from '@/components/Periods/PeriodCards';
import { PeriodDialog } from '@/components/Periods/PeriodDialog';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';

interface PeriodPageFilters {
  q: string;
  academic_year: string;
  semester: string;
  is_active: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const PeriodsPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<PeriodPageFilters>({
    defaults: {
      q: '',
      academic_year: 'all',
      semester: 'all',
      is_active: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [viewingPeriod, setViewingPeriod] = useState<Period | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<Period | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();
  const canManage = isAdmin();

  // Fetch periods function
  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const params: PeriodFilterParams = {
        page: filters.page,
        size: filters.size,
        academic_year: filters.academic_year !== 'all' ? filters.academic_year : undefined,
        semester: filters.semester !== 'all' ? filters.semester : undefined,
        is_active: filters.is_active !== 'all' ? filters.is_active === 'true' : undefined,
      };

      // Add search functionality (not in API but we can filter client-side or extend API)
      const response = await periodService.getPeriods(params);

      // Client-side search if q is provided - only show filtered results
      let filteredPeriods = response.items;
      if (filters.q) {
        filteredPeriods = response.items.filter(period =>
          period.academic_year.toLowerCase().includes(filters.q.toLowerCase()) ||
          period.semester.toLowerCase().includes(filters.q.toLowerCase()) ||
          (period.description && period.description.toLowerCase().includes(filters.q.toLowerCase()))
        );
        // Use filtered results for pagination when searching
        setPeriods(filteredPeriods);
        setTotalItems(filteredPeriods.length);
        setTotalPages(Math.ceil(filteredPeriods.length / filters.size));
      } else {
        // Use API response pagination when not searching
        setPeriods(response.items);
        setTotalItems(response.total);
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error('Failed to fetch periods:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data periode. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch periods when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchPeriods();
    }
  }, [filters.page, filters.size, filters.q, filters.academic_year, filters.semester, filters.is_active, hasAccess]);

  // Pagination handled by totalPages state

  const handleView = (period: Period) => {
    setViewingPeriod(period);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
    setIsDialogOpen(true);
  };

  const handleDelete = (period: Period) => {
    setPeriodToDelete(period);
  };


  const confirmDeletePeriod = async () => {
    if (periodToDelete) {
      try {
        await periodService.deletePeriod(periodToDelete.id);
        setPeriodToDelete(null);
        fetchPeriods(); // Refresh the list
        toast({
          title: 'Periode berhasil dihapus',
          description: `Periode ${periodToDelete.academic_year} ${periodToDelete.semester} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete period:', error);
        const errorMessage = error?.message || 'Gagal menghapus periode. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingPeriod(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (periodData: any) => {
    try {
      if (editingPeriod) {
        // Check if status has changed and handle activate/deactivate separately
        const statusChanged = editingPeriod.is_active !== periodData.is_active;

        // First update the period data (excluding status)
        const { is_active, ...updateData } = periodData;
        await periodService.updatePeriod(editingPeriod.id, updateData);

        // Then handle status change if needed
        if (statusChanged) {
          if (periodData.is_active) {
            await periodService.activatePeriod(editingPeriod.id);
          } else {
            await periodService.deactivatePeriod(editingPeriod.id);
          }
        }

        toast({
          title: 'Periode berhasil diperbarui',
          description: `Periode ${periodData.academic_year} ${periodData.semester} telah diperbarui.`,
        });
      } else {
        // Create new period
        await periodService.createPeriod(periodData);
        toast({
          title: 'Periode berhasil dibuat',
          description: `Periode ${periodData.academic_year} ${periodData.semester} telah ditambahkan ke sistem.`,
        });
      }
      setIsDialogOpen(false);
      setEditingPeriod(null);
      fetchPeriods(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to save period:', error);
      const errorMessage = error?.message || 'Gagal menyimpan periode. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    updateURL({ size: parseInt(value), page: 1 });
  };

  // Filter handlers
  const handleSearchChange = (q: string) => {
    updateURL({ q, page: 1 });
  };

  const handleAcademicYearFilterChange = (academic_year: string) => {
    updateURL({ academic_year, page: 1 });
  };

  const handleSemesterFilterChange = (semester: string) => {
    updateURL({ semester, page: 1 });
  };

  const handleStatusFilterChange = (is_active: string) => {
    updateURL({ is_active, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Daftar Periode";
    const activeFilters = [];

    if (filters.academic_year !== 'all') {
      activeFilters.push(`TA ${filters.academic_year}`);
    }

    if (filters.semester !== 'all') {
      activeFilters.push(`Semester ${filters.semester}`);
    }

    if (filters.is_active !== 'all') {
      activeFilters.push(filters.is_active === 'true' ? 'Aktif' : 'Tidak Aktif');
    }

    if (activeFilters.length > 0) {
      title += " - " + activeFilters.join(" - ");
    }

    return title;
  };

  // Generate academic year options from existing periods or default range
  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = new Set<string>();

    // Add years from existing periods
    periods.forEach(period => years.add(period.academic_year));

    // Add current and nearby years if no periods exist
    if (years.size === 0) {
      for (let i = -5; i <= 5; i++) {
        const year = currentYear + i;
        years.add(`${year}/${year + 1}`);
      }
    }

    return Array.from(years).sort();
  };

  // Check access after all hooks have been called
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Periode"
        description="Kelola periode akademik, atur tahun ajaran dan semester"
        actions={
          canManage ? (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Periode
            </Button>
          ) : undefined
        }
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="academic-year-filter">Tahun Akademik</Label>
          <Select value={filters.academic_year} onValueChange={handleAcademicYearFilterChange}>
            <SelectTrigger id="academic-year-filter">
              <SelectValue placeholder="Filter berdasarkan tahun akademik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {getAcademicYearOptions().map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester-filter">Semester</Label>
          <Select value={filters.semester} onValueChange={handleSemesterFilterChange}>
            <SelectTrigger id="semester-filter">
              <SelectValue placeholder="Filter berdasarkan semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Semester</SelectItem>
              <SelectItem value="Ganjil">Ganjil</SelectItem>
              <SelectItem value="Genap">Genap</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filters.is_active} onValueChange={handleStatusFilterChange}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola periode akademik, atur tahun ajaran dan semester"
            />

            <SearchContainer
              searchQuery={filters.q}
              onSearchChange={handleSearchChange}
              placeholder="Cari periode berdasarkan tahun akademik, semester, atau deskripsi..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <PeriodTable
                periods={periods}
                loading={loading}
                onView={handleView}
                onEdit={canManage ? handleEdit : () => { }}
                onDelete={canManage ? handleDelete : () => { }}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <PeriodCards
                periods={periods}
                loading={loading}
                onView={handleView}
                onEdit={canManage ? handleEdit : () => { }}
                onDelete={canManage ? handleDelete : () => { }}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                itemsPerPage={filters.size}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Period Dialog */}
      {canManage && (
        <PeriodDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingPeriod={editingPeriod}
          onSave={handleSave}
        />
      )}

      {/* Period View Dialog */}
      {viewingPeriod && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Periode</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tahun Akademik</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingPeriod.academic_year}
                </div>
              </div>
              <div>
                <Label>Semester</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingPeriod.semester}
                </div>
              </div>
              <div>
                <Label>Tanggal Mulai</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {new Date(viewingPeriod.start_date).toLocaleDateString('id-ID')}
                </div>
              </div>
              <div>
                <Label>Tanggal Selesai</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {new Date(viewingPeriod.end_date).toLocaleDateString('id-ID')}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingPeriod.is_active ? 'Aktif' : 'Tidak Aktif'}
                </div>
              </div>
              <div>
                <Label>Dibuat</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {new Date(viewingPeriod.created_at).toLocaleDateString('id-ID')}
                </div>
              </div>
              {viewingPeriod.description && (
                <div className="md:col-span-2">
                  <Label>Deskripsi</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingPeriod.description}
                  </div>
                </div>
              )}
              {viewingPeriod.updated_at && (
                <div className="md:col-span-2">
                  <Label>Terakhir Diperbarui</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {new Date(viewingPeriod.updated_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!periodToDelete} onOpenChange={() => setPeriodToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Periode{' '}
              <span className="font-semibold">
                {periodToDelete?.academic_year} {periodToDelete?.semester}
              </span>{' '}
              akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePeriod}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Periode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default PeriodsPage;