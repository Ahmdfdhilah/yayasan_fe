import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { User, UserFilterParams } from '@/services/users/types';
import { UserRole, UserStatus } from '@/services/auth/types';
import { getRoleOptions, getRoleDisplayName } from '@/utils/role';
import { userService } from '@/services/users';
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
import { UserTable } from '@/components/Users/UserTable';
import { UserCards } from '@/components/Users/UserCards';
import { UserDialog } from '@/components/Users/UserDialog';
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

interface UserPageFilters {
  search: string;
  role: string;
  status: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const UsersPage: React.FC = () => {
  const { isAdmin, isSuperAdmin } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<UserPageFilters>({
    defaults: {
      search: '',
      role: 'all',
      status: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Calculate access control
  const hasAccess = isAdmin() || isSuperAdmin();

  // Fetch users function
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: UserFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
        role: filters.role !== 'all' ? filters.role as UserRole : undefined,
        status: filters.status !== 'all' ? filters.status as UserStatus : undefined,
      };

      const response = await userService.getUsers(params);
      setUsers(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      const errorMessage = error?.message || 'Gagal memuat data pengguna. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch users when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchUsers();
    }
  }, [filters.page, filters.size, filters.search, filters.role, filters.status, hasAccess]);

  // Pagination handled by totalPages state

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    // Check if current user can edit this user
    if (!canModifyUser()) {
      const message = user.role === 'SUPER_ADMIN' 
        ? 'Super Admin tidak dapat diubah untuk keamanan sistem.'
        : 'Anda tidak memiliki akses untuk mengedit user ini.';
      toast({
        title: 'Akses Ditolak',
        description: message,
        variant: 'destructive'
      });
      return;
    }
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    // Check if current user can delete this user
    if (!canDeleteUser()) {
      const message = user.role === 'SUPER_ADMIN' 
        ? 'Super Admin tidak dapat dihapus untuk keamanan sistem.'
        : 'Anda tidak memiliki akses untuk menghapus user ini.';
      toast({
        title: 'Akses Ditolak',
        description: message,
        variant: 'destructive'
      });
      return;
    }
    setUserToDelete(user);
  };

  // Helper function to check if current user can modify target user
  const canModifyUser = () => {
    // SUPER_ADMIN can modify anyone
    if (isSuperAdmin() || isAdmin()) {
      return true;
    }

    // Other roles cannot modify anyone
    return false;
  };

  // Helper function to check if current user can delete target user
  const canDeleteUser = () => {
    // CRITICAL PROTECTION: SUPER_ADMIN accounts can NEVER be deleted
    if (isSuperAdmin()) {
      return false;
    }
    
    return canModifyUser();
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await userService.deleteUser(userToDelete.id);
        setUserToDelete(null);
        fetchUsers(); // Refresh the list
        toast({
          title: 'User berhasil dihapus',
          description: `User ${userToDelete.profile?.name || userToDelete.display_name} telah dihapus dari sistem.`,
          variant: 'default'
        });
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        const errorMessage = error?.message || 'Gagal menghapus pengguna. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (userData: any) => {
    try {
      if (editingUser) {
        // Update existing user
        await userService.updateUser(editingUser.id, userData);
        toast({
          title: 'User berhasil diperbarui',
          description: `Data user ${userData.profile?.name || 'pengguna'} telah diperbarui.`,
          variant: 'default'
        });
      } else {
        // Create new user
        await userService.createUser(userData);
        toast({
          title: 'User berhasil dibuat',
          description: `User ${userData.profile?.name || 'pengguna'} telah ditambahkan ke sistem.`,
          variant: 'default'
        });
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to save user:', error);
      const errorMessage = error?.message || 'Gagal menyimpan pengguna. Silakan coba lagi.';
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
    // Only update if search value actually changed
    if (search !== filters.search) {
      updateURL({ search, page: 1 });
    }
  }, [updateURL, filters.search]);

  const handleRoleChange = useCallback((role: string) => {
    // Only update if role value actually changed
    if (role !== filters.role) {
      updateURL({ role, page: 1 });
    }
  }, [updateURL, filters.role]);

  const handleStatusChange = useCallback((status: string) => {
    // Only update if status value actually changed
    if (status !== filters.status) {
      updateURL({ status, page: 1 });
    }
  }, [updateURL, filters.status]);

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Role options based on PKG system
  const roleOptions = getRoleOptions();

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Daftar Pengguna";
    const activeFilters = [];
    
    if (filters.role !== 'all') {
      const role = roleOptions.find(r => r.value === filters.role);
      if (role) activeFilters.push(role.label);
    }
    
    if (filters.status !== 'all') {
      activeFilters.push(filters.status === UserStatus.ACTIVE ? 'Aktif' : 'Tidak Aktif');
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
        title="Manajemen Pengguna"
        description="Kelola pengguna sistem, peran, dan hak akses"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah User
          </Button>
        }
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="role-filter">Role</Label>
          <Select value={filters.role} onValueChange={handleRoleChange}>
            <SelectTrigger id="role-filter">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              {roleOptions.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Aktif</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola pengguna sistem, peran, dan hak akses"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari nama, email, NIP, atau telepon..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <UserTable
                users={users}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canModifyUser={canModifyUser}
                canDeleteUser={canDeleteUser}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <UserCards
                users={users}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canModifyUser={canModifyUser}
                canDeleteUser={canDeleteUser}
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

      {/* User Dialog */}
      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingUser={editingUser}
        onSave={handleSave}
      />

      {/* User View Dialog */}
      {viewingUser && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nama</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingUser.profile?.name || viewingUser.display_name}
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingUser.email}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingUser.status}
                </div>
              </div>
              <div>
                <Label>Role</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {getRoleDisplayName(viewingUser.role)}
                </div>
              </div>
              {viewingUser.profile?.phone && (
                <div>
                  <Label>Telepon</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingUser.profile.phone}
                  </div>
                </div>
              )}
              {viewingUser.profile?.position && (
                <div>
                  <Label>Posisi</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingUser.profile.position}
                  </div>
                </div>
              )}
              {viewingUser.profile?.address && (
                <div>
                  <Label>Alamat</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingUser.profile.address}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. User{' '}
              <span className="font-semibold">{userToDelete?.profile?.name || userToDelete?.display_name}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;