import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Gallery, GalleryFilterParams } from '@/services/galleries/types';
import { galleryService } from '@/services/galleries';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Plus } from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import { GalleryTable } from '@/components/Galleries/GalleryTable';
import { GalleryCards } from '@/components/Galleries/GalleryCards';
import { GalleryDialog } from '@/components/Galleries/GalleryDialog';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
import Pagination from '@/components/common/Pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@workspace/ui/components/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { getGalleryImageUrl } from '@/utils/imageUtils';

interface GalleryPageFilters {
  search: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const GalleriesPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  const { updateURL, getCurrentFilters } = useURLFilters<GalleryPageFilters>({
    defaults: { search: '', page: 1, size: 10 },
    cleanDefaults: true,
  });

  const filters = getCurrentFilters();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [viewingGallery, setViewingGallery] = useState<Gallery | null>(null);
  const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);

  const hasAccess = isAdmin();

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const params: GalleryFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
      };

      const response = await galleryService.getGalleries(params);
      setGalleries(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch galleries:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Galeri. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchGalleries();
    }
  }, [filters.page, filters.size, filters.search, hasAccess]);


  const handleView = (gallery: Gallery) => {
    setViewingGallery(gallery);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setIsDialogOpen(true);
  };

  const handleDelete = (gallery: Gallery) => {
    setGalleryToDelete(gallery);
  };

  const confirmDeleteGallery = async () => {
    if (galleryToDelete) {
      try {
        await galleryService.deleteGallery(galleryToDelete.id);
        setGalleryToDelete(null);
        fetchGalleries();
        toast({
          title: 'Galeri berhasil dihapus',
          description: `Galeri ${galleryToDelete.title} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete gallery:', error);
        const errorMessage = error?.message || 'Gagal menghapus Galeri. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingGallery(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: any, image?: File) => {
    try {
      if (editingGallery) {
        await galleryService.updateGallery(editingGallery.id, data, image);
        toast({
          title: 'Galeri berhasil diperbarui',
          description: `Galeri ${data.title} telah diperbarui.`,
        });
      } else {
        if (!image) {
          toast({
            title: 'Gambar wajib diupload',
            description: 'Silakan pilih gambar untuk galeri baru.',
            variant: 'destructive',
          });
          return;
        }
        await galleryService.createGallery(data, image);
        toast({
          title: 'Galeri berhasil dibuat',
          description: `Galeri ${data.title} telah ditambahkan ke sistem.`,
        });
      }
      setIsDialogOpen(false);
      setEditingGallery(null);
      fetchGalleries();
    } catch (error: any) {
      console.error('Failed to save gallery:', error);
      const errorMessage = error?.message || 'Gagal menyimpan Galeri. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

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
        title="Manajemen Galeri"
        description="Kelola galeri foto dan atur urutan tampilan"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Galeri
          </Button>
        }
      />


      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title="Daftar Galeri"
              subtitle="Kelola galeri foto dan atur urutan tampilan"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={(search) => updateURL({ search, page: 1 })}
              placeholder="Cari galeri berdasarkan judul..."
            />

            <div className="hidden lg:block">
              <GalleryTable
                galleries={galleries}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            <div className="lg:hidden">
              <GalleryCards
                galleries={galleries}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                itemsPerPage={filters.size}
                totalItems={totalItems}
                onPageChange={(page) => updateURL({ page })}
                onItemsPerPageChange={(value) => updateURL({ size: parseInt(value), page: 1 })}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <GalleryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingGallery={editingGallery}
        onSave={handleSave}
      />

      {viewingGallery && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Galeri</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Gambar</Label>
                <div className="p-2 bg-muted rounded">
                  <img 
                    src={getGalleryImageUrl(viewingGallery.img_url)} 
                    alt={viewingGallery.title}
                    className="w-full max-w-md h-auto rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Judul</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingGallery.title}
                  </div>
                </div>
              </div>
              {viewingGallery.excerpt && (
                <div>
                  <Label>Deskripsi</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingGallery.excerpt}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!galleryToDelete} onOpenChange={() => setGalleryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Galeri{' '}
              <span className="font-semibold">{galleryToDelete?.title}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGallery}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Galeri
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GalleriesPage;