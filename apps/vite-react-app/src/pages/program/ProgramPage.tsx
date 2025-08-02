import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Program, ProgramFilterParams } from '@/services/program/types';
import { programService } from '@/services/program';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import { ProgramTable } from '@/components/Program/ProgramTable';
import { ProgramCards } from '@/components/Program/ProgramCards';
import { ProgramDialog } from '@/components/Program/ProgramDialog';
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

interface ProgramPageFilters {
  search: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const ProgramPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<ProgramPageFilters>({
    defaults: {
      search: '',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [viewingProgram, setViewingProgram] = useState<Program | null>(null);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();

  // Fetch programs function
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params: ProgramFilterParams = {
        skip: (filters.page - 1) * filters.size,
        limit: filters.size,
        search: filters.search || undefined,
      };

      const response = await programService.getPrograms(params);
      setPrograms(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Program. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch programs when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchPrograms();
    }
  }, [filters.page, filters.size, filters.search, hasAccess]);

  const handleView = (program: Program) => {
    setViewingProgram(program);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleDelete = (program: Program) => {
    setProgramToDelete(program);
  };

  const handleCreate = () => {
    setEditingProgram(null);
    setIsDialogOpen(true);
  };

  const handleSave = useCallback(async (data: any, image?: File) => {
    try {
      if (editingProgram) {
        await programService.updateProgram(editingProgram.id, data, image);
      } else {
        await programService.createProgram(data, image);
      }
      await fetchPrograms();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Gagal menyimpan program');
    }
  }, [editingProgram]);

  const confirmDelete = async () => {
    if (!programToDelete) return;

    try {
      await programService.deleteProgram(programToDelete.id);
      toast({
        title: 'Berhasil',
        description: 'Program berhasil dihapus.',
      });
      await fetchPrograms();
    } catch (error: any) {
      console.error('Failed to delete program:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus program.',
        variant: 'destructive'
      });
    } finally {
      setProgramToDelete(null);
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
        title="Manajemen Program"
        description="Kelola data program dan kegiatan yayasan"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Program
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchContainer
          searchQuery={filters.search}
          onSearchChange={handleSearch}
          placeholder="Cari program..."
        />
      </div>

      {/* List Header */}
      <ListHeaderComposite
        title="Daftar Program"
        subtitle={`${totalItems} program ditemukan`}
      />

      {/* Content */}
      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <ProgramTable
            programs={programs}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden">
          <ProgramCards
            programs={programs}
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
      <ProgramDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingProgram={editingProgram}
        onSave={handleSave}
        mode={editingProgram ? 'edit' : 'create'}
      />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Program</DialogTitle>
          </DialogHeader>
          {viewingProgram && (
            <ProgramDialog
              open={isViewDialogOpen}
              onOpenChange={setIsViewDialogOpen}
              editingProgram={viewingProgram}
              onSave={() => {}}
              mode="view"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!programToDelete} onOpenChange={() => setProgramToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Program</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus program "{programToDelete?.title}"? 
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

export default ProgramPage;