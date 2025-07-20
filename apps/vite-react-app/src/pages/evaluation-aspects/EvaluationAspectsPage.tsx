import React, { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useToast } from '@workspace/ui/components/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
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
import { PageHeader } from '@/components/common/PageHeader';
import { CategorySection } from '@/components/EvaluationAspects';
import { evaluationAspectService } from '@/services';
import { useRole } from '@/hooks/useRole';
import type {
  EvaluationAspect,
  EvaluationAspectCreate,
  EvaluationAspectUpdate,
} from '@/services/evaluation-aspects/types';
import { Plus, Search } from 'lucide-react';

export const EvaluationAspectsPage: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin } = useRole();

  const [aspects, setAspects] = useState<EvaluationAspect[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAspectId, setEditingAspectId] = useState<number | null>(null);
  const [newAspectCategory, setNewAspectCategory] = useState<string | null>(null);
  
  // Dialog states
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [aspectToDelete, setAspectToDelete] = useState<EvaluationAspect | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      toast({
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        variant: 'destructive'
      });
      return;
    }

    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [aspectsResponse, categoriesData] = await Promise.all([
        evaluationAspectService.getEvaluationAspects(),
        evaluationAspectService.getCategories(),
      ]);

      setAspects(aspectsResponse.items);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Error loading evaluation aspects:', error);
      const errorMessage = error?.message || 'Gagal memuat data aspek evaluasi. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAspect = (categoryName: string) => {
    setEditingAspectId(null);
    setNewAspectCategory(categoryName);
  };

  const handleEditAspect = (aspect: EvaluationAspect) => {
    setNewAspectCategory(null);
    setEditingAspectId(aspect.id);
  };

  const handleCancelEdit = () => {
    setEditingAspectId(null);
    setNewAspectCategory(null);
  };

  const handleSaveAspect = async (
    aspectId: number | null,
    data: EvaluationAspectCreate | EvaluationAspectUpdate
  ) => {
    try {
      setSaving(true);

      if (aspectId) {
        // Update existing aspect
        const updatedAspect = await evaluationAspectService.updateEvaluationAspect(
          aspectId,
          data as EvaluationAspectUpdate
        );

        setAspects(prev =>
          prev.map(aspect =>
            aspect.id === aspectId ? updatedAspect : aspect
          )
        );

        toast({
          title: 'Berhasil',
          description: 'Aspek evaluasi berhasil diperbarui.',
        });
      } else {
        // Create new aspect
        const newAspect = await evaluationAspectService.createEvaluationAspect(
          data as EvaluationAspectCreate
        );

        setAspects(prev => [...prev, newAspect]);

        // Update categories if new category was added
        if (!categories.includes(newAspect.category)) {
          setCategories(prev => [...prev, newAspect.category].sort());
        }

        toast({
          title: 'Berhasil',
          description: 'Aspek evaluasi berhasil ditambahkan.',
        });
      }

      handleCancelEdit();
    } catch (error: any) {
      console.error('Error saving aspect:', error);
      const errorMessage = error?.message || 'Gagal menyimpan aspek evaluasi. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAspect = (aspect: EvaluationAspect) => {
    setAspectToDelete(aspect);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAspect = async () => {
    if (!aspectToDelete) return;
    
    try {
      setSaving(true);

      await evaluationAspectService.deleteEvaluationAspect(aspectToDelete.id);

      setAspects(prev => prev.filter(aspect => aspect.id !== aspectToDelete.id));

      toast({
        title: 'Aspek evaluasi berhasil dihapus',
        description: `Aspek "${aspectToDelete.aspect_name}" telah dihapus dari sistem.`,
      });
    } catch (error: any) {
      console.error('Error deleting aspect:', error);
      const errorMessage = error?.message || 'Gagal menghapus aspek evaluasi. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
      setShowDeleteDialog(false);
      setAspectToDelete(null);
    }
  };

  const handleCreateNewCategory = () => {
    setNewCategoryName('');
    setShowCreateCategoryDialog(true);
  };

  const confirmCreateCategory = () => {
    if (newCategoryName && newCategoryName.trim()) {
      const trimmedName = newCategoryName.trim();
      if (!categories.includes(trimmedName)) {
        setCategories(prev => [...prev, trimmedName].sort());
        handleAddAspect(trimmedName);
        setShowCreateCategoryDialog(false);
        setNewCategoryName('');
        toast({
          title: 'Berhasil',
          description: 'Kategori baru berhasil dibuat.',
        });
      } else {
        toast({
          title: 'Kategori Sudah Ada',
          description: 'Kategori tersebut sudah ada.',
          variant: 'destructive'
        });
      }
    }
  };

  // Filter aspects based on search query
  const filteredAspects = aspects.filter(aspect =>
    aspect.aspect_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    aspect.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (aspect.description && aspect.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group aspects by category
  const aspectsByCategory = filteredAspects.reduce((acc, aspect) => {
    if (!acc[aspect.category]) {
      acc[aspect.category] = [];
    }
    acc[aspect.category].push(aspect);
    return acc;
  }, {} as Record<string, EvaluationAspect[]>);

  // Get all categories that have aspects or are being edited
  const displayCategories = categories.filter(category =>
    aspectsByCategory[category]?.length > 0 || newAspectCategory === category
  );

  if (!isAdmin()) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman manajemen aspek evaluasi.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Aspek Evaluasi"
        description="Kelola aspek-aspek yang digunakan dalam evaluasi kinerja guru"
        actions={
          <Button onClick={handleCreateNewCategory} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bagian Baru
          </Button>
        }
      />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari aspek evaluasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Form Content - Google Forms style */}
      {displayCategories.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-card rounded-lg border p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">
              Mulai membuat formulir evaluasi
            </h3>
            <p className="text-muted-foreground mb-6">
              Buat bagian dan pertanyaan pertama untuk formulir evaluasi Anda
            </p>
            <Button onClick={handleCreateNewCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Bagian Pertama
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {displayCategories.map((category, index) => (
            <CategorySection
              key={category}
              category={category}
              aspects={aspectsByCategory[category] || []}
              categories={categories}
              onAddAspect={handleAddAspect}
              onEditAspect={handleEditAspect}
              onSaveAspect={handleSaveAspect}
              onDeleteAspect={(aspect) => handleDeleteAspect(aspect)}
              editingAspectId={editingAspectId}
              newAspectCategory={newAspectCategory}
              onCancelEdit={handleCancelEdit}
              loading={saving}
              sectionNumber={index + 1}
            />
          ))}
          
          {/* Add Section Button */}
          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleCreateNewCategory} 
              disabled={saving}
              variant="outline"
              className="border-dashed border-2 hover:border-primary hover:bg-primary/5 py-3 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Bagian
            </Button>
          </div>
        </div>
      )}

      {/* Statistics */}
      {displayCategories.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">
            Ringkasan Formulir
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground font-medium">Bagian</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-3xl font-bold text-secondary-foreground">{aspects.length}</div>
              <div className="text-sm text-muted-foreground font-medium">Total Pertanyaan</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Bagian Baru</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nama bagian (contoh: Kompetensi Pedagogik)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  confirmCreateCategory();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateCategoryDialog(false);
                setNewCategoryName('');
              }}
            >
              Batal
            </Button>
            <Button 
              onClick={confirmCreateCategory}
              disabled={!newCategoryName.trim()}
            >
              Buat Bagian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pertanyaan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pertanyaan "{aspectToDelete?.aspect_name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false);
                setAspectToDelete(null);
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAspect}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};