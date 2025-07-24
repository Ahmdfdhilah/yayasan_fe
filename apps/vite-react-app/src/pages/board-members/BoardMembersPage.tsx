import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { BoardMember, BoardMemberFilterParams } from '@/services/board-members/types';
import { boardMemberService } from '@/services/board-members';
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
import { BoardMemberTable } from '@/components/BoardMembers/BoardMemberTable';
import { BoardMemberCards } from '@/components/BoardMembers/BoardMemberCards';
import { BoardMemberDialog } from '@/components/BoardMembers/BoardMemberDialog';
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

interface BoardMemberPageFilters {
  search: string;
  is_active: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const BoardMembersPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<BoardMemberPageFilters>({
    defaults: {
      search: '',
      is_active: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingBoardMember, setEditingBoardMember] = useState<BoardMember | null>(null);
  const [viewingBoardMember, setViewingBoardMember] = useState<BoardMember | null>(null);
  const [boardMemberToDelete, setBoardMemberToDelete] = useState<BoardMember | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();

  // Fetch board members function
  const fetchBoardMembers = async () => {
    setLoading(true);
    try {
      const params: BoardMemberFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
        is_active: filters.is_active !== 'all' ? filters.is_active === 'true' : undefined,
      };

      const response = await boardMemberService.getBoardMembers(params);
      setBoardMembers(response.items);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Anggota Dewan. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch board members when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchBoardMembers();
    }
  }, [filters.page, filters.size, filters.search, filters.is_active, hasAccess]);

  // Pagination
  const totalPages = Math.ceil(totalItems / filters.size);

  const handleView = (boardMember: BoardMember) => {
    setViewingBoardMember(boardMember);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (boardMember: BoardMember) => {
    setEditingBoardMember(boardMember);
    setIsDialogOpen(true);
  };

  const handleDelete = (boardMember: BoardMember) => {
    setBoardMemberToDelete(boardMember);
  };

  const confirmDeleteBoardMember = async () => {
    if (boardMemberToDelete) {
      try {
        await boardMemberService.deleteBoardMember(boardMemberToDelete.id);
        setBoardMemberToDelete(null);
        fetchBoardMembers(); // Refresh the list
        toast({
          title: 'Anggota Dewan berhasil dihapus',
          description: `Anggota Dewan ${boardMemberToDelete.name} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete board member:', error);
        const errorMessage = error?.message || 'Gagal menghapus Anggota Dewan. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingBoardMember(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: any, image?: File) => {
    try {
      if (editingBoardMember) {
        // Update existing board member
        await boardMemberService.updateBoardMember(editingBoardMember.id, data, image);
      } else {
        // Create new board member - image is required
        if (!image) {
          throw new Error('Gambar wajib diupload untuk pengurus baru');
        }
        await boardMemberService.createBoardMember(data, image);
      }
      setIsDialogOpen(false);
      setEditingBoardMember(null);
      fetchBoardMembers(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to save board member:', error);
      const errorMessage = error?.message || 'Gagal menyimpan pengurus. Silakan coba lagi.';
      throw new Error(errorMessage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    updateURL({ size: parseInt(value), page: 1 });
  };

  // Filter handlers
  const handleSearchChange = (search: string) => {
    updateURL({ search, page: 1 });
  };

  const handleActiveFilterChange = (is_active: string) => {
    updateURL({ is_active, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Daftar Anggota Dewan";
    const activeFilters = [];
    
    if (filters.is_active !== 'all') {
      activeFilters.push(filters.is_active === 'true' ? 'Aktif' : 'Tidak Aktif');
    }
    
    if (activeFilters.length > 0) {
      title += " - " + activeFilters.join(" - ");
    }
    
    return title;
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
        title="Manajemen Anggota Dewan"
        description="Kelola anggota dewan, atur urutan tampilan, dan status aktif"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Anggota Dewan
          </Button>
        }
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="active-filter">Status</Label>
          <Select value={filters.is_active} onValueChange={handleActiveFilterChange}>
            <SelectTrigger id="active-filter">
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Anggota</SelectItem>
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
              subtitle="Kelola anggota dewan dan atur urutan tampilan"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari anggota dewan berdasarkan nama atau posisi..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <BoardMemberTable
                boardMembers={boardMembers}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <BoardMemberCards
                boardMembers={boardMembers}
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

      {/* Board Member Dialog */}
      <BoardMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingBoardMember={editingBoardMember}
        onSave={handleSave}
      />

      {/* Board Member View Dialog */}
      {viewingBoardMember && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Anggota Dewan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nama</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingBoardMember.name}
                </div>
              </div>
              <div>
                <Label>Posisi</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingBoardMember.position}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingBoardMember.is_active ? 'Aktif' : 'Tidak Aktif'}
                </div>
              </div>
              <div>
                <Label>Urutan Tampilan</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingBoardMember.display_order}
                </div>
              </div>
              {viewingBoardMember.img_url && (
                <div className="md:col-span-2">
                  <Label>Foto</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    <img 
                      src={viewingBoardMember.img_url} 
                      alt={viewingBoardMember.name}
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                </div>
              )}
              {viewingBoardMember.description && (
                <div className="md:col-span-2">
                  <Label>Deskripsi</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingBoardMember.description}
                  </div>
                </div>
              )}
              <div>
                <Label>Dibuat</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {new Date(viewingBoardMember.created_at).toLocaleDateString('id-ID')}
                </div>
              </div>
              {viewingBoardMember.updated_at && (
                <div>
                  <Label>Terakhir Diperbarui</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {new Date(viewingBoardMember.updated_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!boardMemberToDelete} onOpenChange={() => setBoardMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Anggota Dewan{' '}
              <span className="font-semibold">{boardMemberToDelete?.name}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBoardMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Anggota Dewan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardMembersPage;