import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Statistic, StatisticFilterParams } from '@/services/statistics/types';
import { statisticService } from '@/services/statistics';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {  Plus } from 'lucide-react';
import { StatisticTable } from '@/components/Statistics/StatisticTable';
import { StatisticCards } from '@/components/Statistics/StatisticCards';
import { StatisticDialog } from '@/components/Statistics/StatisticDialog';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
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

interface StatisticPageFilters {
  search: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const StatisticsPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<StatisticPageFilters>({
    defaults: {
      search: '',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingStatistic, setEditingStatistic] = useState<Statistic | null>(null);
  const [viewingStatistic, setViewingStatistic] = useState<Statistic | null>(null);
  const [statisticToDelete, setStatisticToDelete] = useState<Statistic | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();

  // Fetch statistics function
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const params: StatisticFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
        sort_by: 'display_order',
        sort_order: 'asc',
      };

      const response = await statisticService.getStatistics(params);
      setStatistics(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Statistik. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch statistics when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchStatistics();
    }
  }, [filters.page, filters.size, filters.search, hasAccess]);

  const handleView = (statistic: Statistic) => {
    setViewingStatistic(statistic);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (statistic: Statistic) => {
    setEditingStatistic(statistic);
    setIsDialogOpen(true);
  };

  const handleDelete = (statistic: Statistic) => {
    setStatisticToDelete(statistic);
  };

  const confirmDeleteStatistic = async () => {
    if (statisticToDelete) {
      try {
        await statisticService.deleteStatistic(statisticToDelete.id);
        setStatisticToDelete(null);
        fetchStatistics(); // Refresh the list
        toast({
          title: 'Statistik berhasil dihapus',
          description: `Statistik ${statisticToDelete.title} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete statistic:', error);
        const errorMessage = error?.message || 'Gagal menghapus Statistik. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingStatistic(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: any, image?: File) => {
    try {
      if (editingStatistic) {
        // Update existing statistic
        await statisticService.updateStatistic(editingStatistic.id, data, image);
        toast({
          title: 'Statistik berhasil diperbarui',
          description: `Statistik ${data.title} telah diperbarui.`,
        });
      } else {
        // Create new statistic
        await statisticService.createStatistic(data, image);
        toast({
          title: 'Statistik berhasil dibuat',
          description: `Statistik ${data.title} telah ditambahkan ke sistem.`,
        });
      }
      setIsDialogOpen(false);
      setEditingStatistic(null);
      fetchStatistics(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to save statistic:', error);
      const errorMessage = error?.message || 'Gagal menyimpan Statistik. Silakan coba lagi.';
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

  // Filter handlers - memoized to prevent unnecessary calls
  const handleSearchChange = useCallback((search: string) => {
    if (search !== filters.search) {
      updateURL({ search, page: 1 });
    }
  }, [updateURL, filters.search]);

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    return "Daftar Statistik";
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
        title="Manajemen Statistik"
        description="Kelola statistik dan data tampilan untuk website"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Statistik
          </Button>
        }
      />


      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola statistik dan data yang ditampilkan di website"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari statistik berdasarkan judul, deskripsi, atau nilai..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <StatisticTable
                statistics={statistics}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <StatisticCards
                statistics={statistics}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

      {/* Statistic Dialog */}
      <StatisticDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingStatistic={editingStatistic}
        onSave={handleSave}
      />

      {/* Statistic View Dialog */}
      {viewingStatistic && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Statistik</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Judul</Label>
                  <div className="p-2 bg-muted rounded">
                    {viewingStatistic.title}
                  </div>
                </div>
                <div>
                  <Label>Nilai</Label>
                  <div className="p-2 bg-muted rounded font-semibold text-primary">
                    {viewingStatistic.stats}
                  </div>
                </div>
                <div>
                  <Label>Urutan Tampilan</Label>
                  <div className="p-2 bg-muted rounded">
                    #{viewingStatistic.display_order}
                  </div>
                </div>
                <div>
                  <Label>Dibuat</Label>
                  <div className="p-2 bg-muted rounded">
                    {new Date(viewingStatistic.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
                {viewingStatistic.updated_at && (
                  <div>
                    <Label>Terakhir Diupdate</Label>
                    <div className="p-2 bg-muted rounded">
                      {new Date(viewingStatistic.updated_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                )}
              </div>
              
              {viewingStatistic.img_url && (
                <div>
                  <Label>Icon</Label>
                  <div className="p-2 bg-muted rounded">
                    <img 
                      src={viewingStatistic.img_url} 
                      alt={viewingStatistic.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  </div>
                </div>
              )}
              
              {viewingStatistic.description && (
                <div>
                  <Label>Deskripsi</Label>
                  <div className="p-2 bg-muted rounded">
                    {viewingStatistic.description}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!statisticToDelete} onOpenChange={() => setStatisticToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Statistik{' '}
              <span className="font-semibold">{statisticToDelete?.title}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStatistic}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Statistik
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StatisticsPage;