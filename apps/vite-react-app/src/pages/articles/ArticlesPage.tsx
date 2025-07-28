import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Article, ArticleFilterParams } from '@/services/articles/types';
import { articleService } from '@/services/articles';
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
import { ArticleTable } from '@/components/Articles/ArticleTable';
import { ArticleCards } from '@/components/Articles/ArticleCards';
import { ArticleDialog } from '@/components/Articles/ArticleDialog';
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

interface ArticlePageFilters {
  search: string;
  category: string;
  is_published: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const ArticlesPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<ArticlePageFilters>({
    defaults: {
      search: '',
      category: 'all',
      is_published: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  // Calculate access control
  const hasAccess = isAdmin();

  // Fetch articles function
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: ArticleFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        is_published: filters.is_published !== 'all' ? filters.is_published === 'true' : undefined,
      };

      const response = await articleService.getArticles(params);
      setArticles(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Artikel. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await articleService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Effect to fetch articles when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchArticles();
    }
  }, [filters.page, filters.size, filters.search, filters.category, filters.is_published, hasAccess]);

  // Effect to fetch categories on mount
  useEffect(() => {
    if (hasAccess) {
      fetchCategories();
    }
  }, [hasAccess]);

  // Pagination handled by totalPages state

  const handleView = (article: Article) => {
    setViewingArticle(article);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsDialogOpen(true);
  };

  const handleDelete = (article: Article) => {
    setArticleToDelete(article);
  };

  const confirmDeleteArticle = async () => {
    if (articleToDelete) {
      try {
        await articleService.deleteArticle(articleToDelete.id);
        setArticleToDelete(null);
        fetchArticles(); // Refresh the list
        toast({
          title: 'Artikel berhasil dihapus',
          description: `Artikel ${articleToDelete.title} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete article:', error);
        const errorMessage = error?.message || 'Gagal menghapus Artikel. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: any, image?: File) => {
    try {
      if (editingArticle) {
        // Update existing article
        await articleService.updateArticle(editingArticle.id, data, image);
        toast({
          title: 'Artikel berhasil diperbarui',
          description: `Artikel ${data.title} telah diperbarui.`,
        });
      } else {
        // Create new article - image is required
        if (!image) {
          toast({
            title: 'Gambar wajib diupload',
            description: 'Silakan pilih gambar untuk artikel baru.',
            variant: 'destructive',
          });
          return;
        }
        await articleService.createArticle(data, image);
        toast({
          title: 'Artikel berhasil dibuat',
          description: `Artikel ${data.title} telah ditambahkan ke sistem.`,
        });
      }
      setIsDialogOpen(false);
      setEditingArticle(null);
      fetchArticles(); // Refresh the list
      fetchCategories(); // Refresh categories in case new one was added
    } catch (error: any) {
      console.error('Failed to save article:', error);
      const errorMessage = error?.message || 'Gagal menyimpan Artikel. Silakan coba lagi.';
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
  const handleSearchChange = (search: string) => {
    updateURL({ search, page: 1 });
  };

  const handleCategoryFilterChange = (category: string) => {
    updateURL({ category, page: 1 });
  };

  const handlePublishedFilterChange = (is_published: string) => {
    updateURL({ is_published, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Daftar Artikel";
    const activeFilters = [];
    
    if (filters.category !== 'all') {
      activeFilters.push(`Kategori: ${filters.category}`);
    }
    
    if (filters.is_published !== 'all') {
      activeFilters.push(filters.is_published === 'true' ? 'Dipublikasikan' : 'Draft');
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
        title="Manajemen Artikel"
        description="Kelola artikel, publikasikan konten, dan atur kategori"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Artikel
          </Button>
        }
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="category-filter">Kategori</Label>
          <Select value={filters.category} onValueChange={handleCategoryFilterChange}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="Filter berdasarkan kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="published-filter">Status Publikasi</Label>
          <Select value={filters.is_published} onValueChange={handlePublishedFilterChange}>
            <SelectTrigger id="published-filter">
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="true">Dipublikasikan</SelectItem>
              <SelectItem value="false">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola artikel dan konten website"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari artikel berdasarkan judul, deskripsi, atau kategori..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <ArticleTable
                articles={articles}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <ArticleCards
                articles={articles}
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

      {/* Article Dialog */}
      <ArticleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingArticle={editingArticle}
        onSave={handleSave}
      />

      {/* Article View Dialog */}
      {viewingArticle && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Artikel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Judul</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingArticle.title}
                  </div>
                </div>
                <div>
                  <Label>Slug</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingArticle.slug}
                  </div>
                </div>
                <div>
                  <Label>Kategori</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingArticle.category}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingArticle.is_published ? 'Dipublikasikan' : 'Draft'}
                  </div>
                </div>
                {viewingArticle.published_at && (
                  <div>
                    <Label>Tanggal Publikasi</Label>
                    <div className="p-2 bg-muted rounded text-sm">
                      {new Date(viewingArticle.published_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Dibuat</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {new Date(viewingArticle.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
              
              {viewingArticle.img_url && (
                <div>
                  <Label>Gambar</Label>
                  <div className="p-2 bg-muted rounded">
                    <img 
                      src={viewingArticle.img_url} 
                      alt={viewingArticle.title}
                      className="w-full max-w-md h-auto rounded"
                    />
                  </div>
                </div>
              )}
              
              {viewingArticle.excerpt && (
                <div>
                  <Label>Ringkasan</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingArticle.excerpt}
                  </div>
                </div>
              )}
              
              <div>
                <Label>Konten</Label>
                <div className="p-4 bg-muted rounded text-sm max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: viewingArticle.description }} />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Artikel{' '}
              <span className="font-semibold">{articleToDelete?.title}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteArticle}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Artikel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArticlesPage;