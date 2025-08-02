import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Mitra, MitraFilterParams } from '@/services/mitra/types';
import { mitraService } from '@/services/mitra';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import { MitraTable } from '@/components/Mitra/MitraTable';
import { MitraCards } from '@/components/Mitra/MitraCards';
import { MitraDialog } from '@/components/Mitra/MitraDialog';
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

interface MitraPageFilters {
  search: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const MitraPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<MitraPageFilters>({
    defaults: {
      search: '',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);
  const [viewingMitra, setViewingMitra] = useState<Mitra | null>(null);
  const [mitraToDelete, setMitraToDelete] = useState<Mitra | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();

  // Fetch mitras function
  const fetchMitras = async () => {
    setLoading(true);
    try {
      const params: MitraFilterParams = {
        skip: (filters.page - 1) * filters.size,
        limit: filters.size,
        search: filters.search || undefined,
      };

      const response = await mitraService.getMitras(params);
      setMitras(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch mitras:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Mitra. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch mitras when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchMitras();
    }
  }, [filters.page, filters.size, filters.search, hasAccess]);

  const handleView = (mitra: Mitra) => {
    setViewingMitra(mitra);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (mitra: Mitra) => {
    setEditingMitra(mitra);
    setIsDialogOpen(true);
  };

  const handleDelete = (mitra: Mitra) => {
    setMitraToDelete(mitra);
  };

  const handleCreate = () => {
    setEditingMitra(null);
    setIsDialogOpen(true);
  };

  const handleSave = useCallback(async (data: any, image?: File) => {
    try {
      if (editingMitra) {
        await mitraService.updateMitra(editingMitra.id, data, image);
      } else {
        await mitraService.createMitra(data, image);
      }
      await fetchMitras();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Gagal menyimpan mitra');
    }
  }, [editingMitra]);

  const confirmDelete = async () => {
    if (!mitraToDelete) return;

    try {
      await mitraService.deleteMitra(mitraToDelete.id);
      toast({
        title: 'Berhasil',
        description: 'Mitra berhasil dihapus.',
      });
      await fetchMitras();
    } catch (error: any) {
      console.error('Failed to delete mitra:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus mitra.',
        variant: 'destructive'
      });
    } finally {
      setMitraToDelete(null);
    }
  };

  const handleSearch = useCallback((search: string) => {
    updateURL({ search, page: 1 });
  }, [updateURL]);

  const handlePageChange = useCallback((page: number) => {
    updateURL({ page });
  }, [updateURL]);

  const handlePageSizeChange = useCallback((size: number) => {
    updateURL({ size, page: 1 });
  }, [updateURL]);

  // Access control check
  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Akses Ditolak</h1>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Manajemen Mitra"
        description="Kelola data mitra dan kemitraan yayasan"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Mitra
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchContainer
          searchQuery={filters.search}
          onSearchChange={handleSearch}
          placeholder="Cari mitra..."
        />
      </div>

      {/* List Header */}
      <ListHeaderComposite
        title="Daftar Mitra"
        subtitle={`${totalItems} mitra ditemukan`}
      />

      {/* Content */}
      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <MitraTable
            mitras={mitras}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden">
          <MitraCards
            mitras={mitras}
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
            onItemsPerPageChange={(value) => handlePageSizeChange(parseInt(value))}
          />
        )}
      </div>

      {/* Create/Edit Dialog */}
      <MitraDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingMitra={editingMitra}
        onSave={handleSave}
        mode={editingMitra ? 'edit' : 'create'}
      />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Mitra</DialogTitle>
          </DialogHeader>
          {viewingMitra && (
            <MitraDialog
              open={isViewDialogOpen}
              onOpenChange={setIsViewDialogOpen}
              editingMitra={viewingMitra}
              onSave={() => {}}
              mode="view"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!mitraToDelete} onOpenChange={() => setMitraToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Mitra</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mitra "{mitraToDelete?.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MitraPage;