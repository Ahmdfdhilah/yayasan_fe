import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { 
  BoardGroup, 
  BoardGroupFilterParams,
  BoardMember, 
  BoardMemberFilterParams 
} from '@/services/board-members/types';
import { boardMemberService } from '@/services/board-members';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Plus } from 'lucide-react';
import { BoardMemberTable } from '@/components/BoardMembers/BoardMemberTable';
import { BoardMemberCards } from '@/components/BoardMembers/BoardMemberCards';
import { BoardMemberDialog } from '@/components/BoardMembers/BoardMemberDialog';
import { BoardGroupTable } from '@/components/BoardGroups/BoardGroupTable';
import { BoardGroupCards } from '@/components/BoardGroups/BoardGroupCards';
import { BoardGroupDialog } from '@/components/BoardGroups/BoardGroupDialog';
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

interface BoardMemberPageFilters {
  search: string;
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
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  // Board Groups State
  const [boardGroups, setBoardGroups] = useState<BoardGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isGroupViewDialogOpen, setIsGroupViewDialogOpen] = useState(false);
  const [editingBoardGroup, setEditingBoardGroup] = useState<BoardGroup | null>(null);
  const [viewingBoardGroup, setViewingBoardGroup] = useState<BoardGroup | null>(null);
  const [boardGroupToDelete, setBoardGroupToDelete] = useState<BoardGroup | null>(null);

  // Board Members State
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersTotalItems, setMembersTotalItems] = useState(0);
  const [membersTotalPages, setMembersTotalPages] = useState(0);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isMemberViewDialogOpen, setIsMemberViewDialogOpen] = useState(false);
  const [editingBoardMember, setEditingBoardMember] = useState<BoardMember | null>(null);
  const [viewingBoardMember, setViewingBoardMember] = useState<BoardMember | null>(null);
  const [boardMemberToDelete, setBoardMemberToDelete] = useState<BoardMember | null>(null);

  // Calculate access control
  const hasAccess = useMemo(() => isAdmin(), [isAdmin]);

  // Fetch board groups function
  const fetchBoardGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const params: BoardGroupFilterParams = {
        page: 1,
        size: 50, // Get more groups since usually not many
      };

      const response = await boardMemberService.getBoardGroups(params);
      setBoardGroups(response.items);
    } catch (error) {
      console.error('Failed to fetch board groups:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Grup Dewan. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  // Fetch board members function
  const fetchBoardMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const params: BoardMemberFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
      };

      const response = await boardMemberService.getBoardMembers(params);
      setBoardMembers(response.items);
      setMembersTotalItems(response.total);
      setMembersTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Anggota Dewan. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setMembersLoading(false);
    }
  }, [filters.page, filters.size, filters.search]);

  // Effect to fetch data when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchBoardGroups();
      fetchBoardMembers();
    }
  }, [fetchBoardGroups, fetchBoardMembers, hasAccess]);

  // ===== BOARD GROUP HANDLERS =====

  const handleGroupView = (boardGroup: BoardGroup) => {
    setViewingBoardGroup(boardGroup);
    setIsGroupViewDialogOpen(true);
  };

  const handleGroupEdit = (boardGroup: BoardGroup) => {
    setEditingBoardGroup(boardGroup);
    setIsGroupDialogOpen(true);
  };

  const handleGroupDelete = (boardGroup: BoardGroup) => {
    setBoardGroupToDelete(boardGroup);
  };

  const handleGroupCreate = () => {
    setEditingBoardGroup(null);
    setIsGroupDialogOpen(true);
  };

  const handleGroupSave = async (data: any) => {
    try {
      if (editingBoardGroup) {
        await boardMemberService.updateBoardGroup(editingBoardGroup.id, data);
      } else {
        await boardMemberService.createBoardGroup(data);
      }
      setIsGroupDialogOpen(false);
      setEditingBoardGroup(null);
      fetchBoardGroups();
    } catch (error: any) {
      console.error('Failed to save board group:', error);
      const errorMessage = error?.message || 'Gagal menyimpan grup. Silakan coba lagi.';
      throw new Error(errorMessage);
    }
  };

  const confirmDeleteBoardGroup = async () => {
    if (boardGroupToDelete) {
      try {
        await boardMemberService.deleteBoardGroup(boardGroupToDelete.id);
        setBoardGroupToDelete(null);
        fetchBoardGroups();
        toast({
          title: 'Grup berhasil dihapus',
          description: `Grup ${boardGroupToDelete.title} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete board group:', error);
        const errorMessage = error?.message || 'Gagal menghapus grup. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  // ===== BOARD MEMBER HANDLERS =====

  const handleMemberView = (boardMember: BoardMember) => {
    setViewingBoardMember(boardMember);
    setIsMemberViewDialogOpen(true);
  };

  const handleMemberEdit = (boardMember: BoardMember) => {
    setEditingBoardMember(boardMember);
    setIsMemberDialogOpen(true);
  };

  const handleMemberDelete = (boardMember: BoardMember) => {
    setBoardMemberToDelete(boardMember);
  };

  const handleMemberCreate = () => {
    setEditingBoardMember(null);
    setIsMemberDialogOpen(true);
  };

  const confirmDeleteBoardMember = async () => {
    if (boardMemberToDelete) {
      try {
        await boardMemberService.deleteBoardMember(boardMemberToDelete.id);
        setBoardMemberToDelete(null);
        fetchBoardMembers();
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

  const handleMemberSave = async (data: any, image?: File) => {
    try {
      if (editingBoardMember) {
        await boardMemberService.updateBoardMember(editingBoardMember.id, data, image);
      } else {
        if (!image) {
          throw new Error('Gambar wajib diupload untuk anggota baru');
        }
        await boardMemberService.createBoardMember(data, image);
      }
      setIsMemberDialogOpen(false);
      setEditingBoardMember(null);
      fetchBoardMembers();
    } catch (error: any) {
      console.error('Failed to save board member:', error);
      const errorMessage = error?.message || 'Gagal menyimpan anggota. Silakan coba lagi.';
      throw new Error(errorMessage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    updateURL({ size: parseInt(value), page: 1 });
  };

  // Filter handlers
  const handleSearchChange = useCallback((search: string) => {
    if (search !== filters.search) {
      updateURL({ search, page: 1 });
    }
  }, [updateURL, filters.search]);


  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite titles
  const getGroupsCompositeTitle = () => {
    let title = "Daftar Grup Dewan";
    const activeFilters: string[] = [];
    
    if (activeFilters.length > 0) {
      title += " - " + activeFilters.join(" - ");
    }
    
    return title;
  };

  const getMembersCompositeTitle = () => {
    let title = "Daftar Anggota Dewan";
    const activeFilters: string[] = [];
    
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
        title="Manajemen Dewan"
        description="Kelola grup dan anggota dewan serta atur urutan tampilan"
        actions={
          <div className="flex gap-2">
            <Button onClick={handleGroupCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Grup
            </Button>
            <Button onClick={handleMemberCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Anggota
            </Button>
          </div>
        }
      />

      {/* Board Groups Section */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getGroupsCompositeTitle()}
              subtitle="Kelola grup dewan dan atur urutan tampilan"
            />


            {/* Desktop Groups Table */}
            <div className="hidden lg:block">
              <BoardGroupTable
                boardGroups={boardGroups}
                loading={groupsLoading}
                onView={handleGroupView}
                onEdit={handleGroupEdit}
                onDelete={handleGroupDelete}
              />
            </div>

            {/* Mobile Groups Cards */}
            <div className="lg:hidden">
              <BoardGroupCards
                boardGroups={boardGroups}
                loading={groupsLoading}
                onView={handleGroupView}
                onEdit={handleGroupEdit}
                onDelete={handleGroupDelete}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board Members Section */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getMembersCompositeTitle()}
              subtitle="Kelola anggota dewan dan atur urutan tampilan"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari anggota berdasarkan nama..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <BoardMemberTable
                boardMembers={boardMembers}
                loading={membersLoading}
                onView={handleMemberView}
                onEdit={handleMemberEdit}
                onDelete={handleMemberDelete}
                boardGroups={boardGroups}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <BoardMemberCards
                boardMembers={boardMembers}
                loading={membersLoading}
                onView={handleMemberView}
                onEdit={handleMemberEdit}
                onDelete={handleMemberDelete}
                boardGroups={boardGroups}
              />
            </div>

            {/* Pagination */}
            {membersTotalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={membersTotalPages}
                itemsPerPage={filters.size}
                totalItems={membersTotalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Board Group Dialog */}
      <BoardGroupDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        editingBoardGroup={editingBoardGroup}
        onSave={handleGroupSave}
        mode={editingBoardGroup ? 'edit' : 'create'}
      />

      {/* Board Group View Dialog */}
      <BoardGroupDialog
        open={isGroupViewDialogOpen}
        onOpenChange={setIsGroupViewDialogOpen}
        editingBoardGroup={viewingBoardGroup}
        onSave={() => {}}
        mode="view"
      />

      {/* Board Member Dialog */}
      <BoardMemberDialog
        open={isMemberDialogOpen}
        onOpenChange={setIsMemberDialogOpen}
        editingBoardMember={editingBoardMember}
        onSave={handleMemberSave}
        mode={editingBoardMember ? 'edit' : 'create'}
        boardGroups={boardGroups}
      />

      {/* Board Member View Dialog */}
      <BoardMemberDialog
        open={isMemberViewDialogOpen}
        onOpenChange={setIsMemberViewDialogOpen}
        editingBoardMember={viewingBoardMember}
        onSave={() => {}}
        mode="view"
        boardGroups={boardGroups}
      />

      {/* Group Delete Confirmation Dialog */}
      <AlertDialog open={!!boardGroupToDelete} onOpenChange={() => setBoardGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Grup</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Grup{' '}
              <span className="font-semibold">{boardGroupToDelete?.title}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBoardGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Grup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member Delete Confirmation Dialog */}
      <AlertDialog open={!!boardMemberToDelete} onOpenChange={() => setBoardMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Anggota</AlertDialogTitle>
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
              Hapus Anggota
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardMembersPage;