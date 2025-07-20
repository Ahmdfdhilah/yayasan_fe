import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { User, UserFilterParams } from '@/services/users/types';
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

interface UserPageFilters {
  search: string;
  role: string;
  status: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const UsersPage: React.FC = () => {
  const { isAdmin } = useRole();
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();

  // Fetch users function
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: UserFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
        role: filters.role !== 'all' ? filters.role as 'ADMIN' | 'INSPEKTORAT' | 'PERWADAG' : undefined,
        is_active: filters.status !== 'all' ? filters.status === 'active' : undefined,
      };

      const response = await userService.getUsers(params);
      setUsers(response.items);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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

  // Pagination
  const totalPages = Math.ceil(totalItems / filters.size);

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await userService.deleteUser(userToDelete.id);
        setUserToDelete(null);
        fetchUsers(); // Refresh the list
        toast({
          title: 'User berhasil dihapus',
          description: `User ${userToDelete.nama} telah dihapus dari sistem.`,
          variant: 'default'
        });
      } catch (error) {
        console.error('Failed to delete user:', error);
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
          description: `Data user ${userData.nama} telah diperbarui.`,
          variant: 'default'
        });
      } else {
        // Create new user
        await userService.createUser(userData);
        toast({
          title: 'User berhasil dibuat',
          description: `User ${userData.nama} telah ditambahkan ke sistem.`,
          variant: 'default'
        });
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    updateURL({ size: parseInt(value), page: 1 });
  };

  // Filter handlers
  const handleSearchChange = (search: string) => {
    updateURL({ search, page: 1 });
  };

  const handleRoleChange = (role: string) => {
    updateURL({ role, page: 1 });
  };

  const handleStatusChange = (status: string) => {
    updateURL({ status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Role options
  const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'INSPEKTORAT', label: 'Inspektorat' },
    { value: 'PERWADAG', label: 'Perwadag' },
  ];

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Daftar Pengguna";
    const activeFilters = [];
    
    if (filters.role !== 'all') {
      const role = roleOptions.find(r => r.value === filters.role);
      if (role) activeFilters.push(role.label);
    }
    
    if (filters.status !== 'all') {
      activeFilters.push(filters.status === 'active' ? 'Aktif' : 'Tidak Aktif');
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
        title="User Management"
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
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
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
      <UserViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        user={viewingUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. User{' '}
              <span className="font-semibold">{userToDelete?.nama}</span> akan dihapus
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