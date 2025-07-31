import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Organization, OrganizationFilterParams } from '@/services/organizations/types';
import { organizationService } from '@/services/organizations';
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
import { OrganizationTable } from '@/components/Organizations/OrganizationTable';
import { OrganizationCards } from '@/components/Organizations/OrganizationCards';
import { OrganizationDialog } from '@/components/Organizations/OrganizationDialog';
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

interface OrganizationPageFilters {
  q: string;
  has_users: string;
  has_head: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const OrganizationsPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<OrganizationPageFilters>({
    defaults: {
      q: '',
      has_users: 'all',
      has_head: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();

  // Fetch organizations function
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params: OrganizationFilterParams = {
        page: filters.page,
        size: filters.size,
        q: filters.q || undefined,
        has_users: filters.has_users !== 'all' ? filters.has_users === 'true' : undefined,
        has_head: filters.has_head !== 'all' ? filters.has_head === 'true' : undefined,
      };

      const response = await organizationService.getOrganizations(params);
      setOrganizations(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Sekolah. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch organizations when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchOrganizations();
    }
  }, [filters.page, filters.size, filters.q, filters.has_users, filters.has_head, hasAccess]);

  // Pagination handled by totalPages state

  const handleView = (organization: Organization) => {
    setViewingOrganization(organization);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (organization: Organization) => {
    setEditingOrganization(organization);
    setIsDialogOpen(true);
  };

  const handleDelete = (organization: Organization) => {
    setOrganizationToDelete(organization);
  };

  const confirmDeleteOrganization = async () => {
    if (organizationToDelete) {
      try {
        await organizationService.deleteOrganization(organizationToDelete.id);
        setOrganizationToDelete(null);
        fetchOrganizations(); // Refresh the list
        toast({
          title: 'Sekolah berhasil dihapus',
          description: `Sekolah ${organizationToDelete.name} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete organization:', error);
        const errorMessage = error?.message || 'Gagal menghapus Sekolah. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingOrganization(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: any, image?: File) => {
    try {
      if (editingOrganization) {
        // Update existing organization
        await organizationService.updateOrganization(editingOrganization.id, data, image);
        toast({
          title: 'Sekolah berhasil diperbarui',
          description: `Sekolah ${data.name} telah diperbarui.`,
        });
      } else {
        // Create new organization
        await organizationService.createOrganization(data, image);
        toast({
          title: 'Sekolah berhasil dibuat',
          description: `Sekolah ${data.name} telah ditambahkan ke sistem.`,
        });
      }
      setIsDialogOpen(false);
      setEditingOrganization(null);
      fetchOrganizations(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to save organization:', error);
      const errorMessage = error?.message || 'Gagal menyimpan Sekolah. Silakan coba lagi.';
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

  const handleUsersFilterChange = (has_users: string) => {
    updateURL({ has_users, page: 1 });
  };

  const handleHeadFilterChange = (has_head: string) => {
    updateURL({ has_head, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Daftar Sekolah";
    const activeFilters = [];
    
    if (filters.has_users !== 'all') {
      activeFilters.push(filters.has_users === 'true' ? 'Dengan Pengguna' : 'Tanpa Pengguna');
    }
    
    if (filters.has_head !== 'all') {
      activeFilters.push(filters.has_head === 'true' ? 'Dengan Kepala' : 'Tanpa Kepala');
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
        title="Manajemen Sekolah"
        description="Kelola Sekolah, tetapkan kepala Sekolah, dan lihat jumlah pengguna"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Sekolah
          </Button>
        }
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="users-filter">Pengguna</Label>
          <Select value={filters.has_users} onValueChange={handleUsersFilterChange}>
            <SelectTrigger id="users-filter">
              <SelectValue placeholder="Filter berdasarkan pengguna" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sekolah</SelectItem>
              <SelectItem value="true">Dengan Pengguna</SelectItem>
              <SelectItem value="false">Tanpa Pengguna</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="head-filter">Kepala Sekolah</Label>
          <Select value={filters.has_head} onValueChange={handleHeadFilterChange}>
            <SelectTrigger id="head-filter">
              <SelectValue placeholder="Filter berdasarkan kepala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sekolah</SelectItem>
              <SelectItem value="true">Dengan Kepala</SelectItem>
              <SelectItem value="false">Tanpa Kepala</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola Sekolah, tetapkan kepala Sekolah, dan lihat jumlah pengguna"
            />

            <SearchContainer
              searchQuery={filters.q}
              onSearchChange={handleSearchChange}
              placeholder="Cari Sekolah berdasarkan nama atau deskripsi..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <OrganizationTable
                organizations={organizations}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <OrganizationCards
                organizations={organizations}
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

      {/* Organization Dialog */}
      <OrganizationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingOrganization={editingOrganization}
        onSave={handleSave}
      />

      {/* Organization View Dialog */}
      {viewingOrganization && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Sekolah</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nama</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingOrganization.name}
                </div>
              </div>
              <div>
                <Label>Nama Tampilan</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingOrganization.display_name}
                </div>
              </div>
              <div>
                <Label>Jumlah Pengguna</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingOrganization.user_count} pengguna
                </div>
              </div>
              <div>
                <Label>Kepala Sekolah</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingOrganization.head_name || 'Belum ada kepala'}
                </div>
              </div>
              {viewingOrganization.description && (
                <div className="md:col-span-2">
                  <Label>Deskripsi</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingOrganization.description}
                  </div>
                </div>
              )}
              <div>
                <Label>Dibuat</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {new Date(viewingOrganization.created_at).toLocaleDateString('id-ID')}
                </div>
              </div>
              {viewingOrganization.updated_at && (
                <div>
                  <Label>Terakhir Diperbarui</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {new Date(viewingOrganization.updated_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!organizationToDelete} onOpenChange={() => setOrganizationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Sekolah{' '}
              <span className="font-semibold">{organizationToDelete?.name}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrganization}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Sekolah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrganizationsPage;