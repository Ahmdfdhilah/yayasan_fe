import React, { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useToast } from '@workspace/ui/components/sonner';
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
    } catch (error) {
      console.error('Error loading evaluation aspects:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data aspek evaluasi.',
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
    } catch (error) {
      console.error('Error saving aspect:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan aspek evaluasi.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAspect = async (aspectId: number) => {
    try {
      setSaving(true);

      await evaluationAspectService.deleteEvaluationAspect(aspectId);

      setAspects(prev => prev.filter(aspect => aspect.id !== aspectId));

      toast({
        title: 'Berhasil',
        description: 'Aspek evaluasi berhasil dihapus.',
      });
    } catch (error) {
      console.error('Error deleting aspect:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus aspek evaluasi.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewCategory = () => {
    const categoryName = prompt('Masukkan nama kategori baru:');
    if (categoryName && categoryName.trim()) {
      const trimmedName = categoryName.trim();
      if (!categories.includes(trimmedName)) {
        setCategories(prev => [...prev, trimmedName].sort());
        handleAddAspect(trimmedName);
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
      />

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari aspek evaluasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateNewCategory} disabled={saving}>
          <Plus className="h-4 w-4 mr-2" />
          Kategori Baru
        </Button>
      </div>

      {/* Categories */}
      {displayCategories.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Belum Ada Aspek Evaluasi</h3>
          <p className="text-muted-foreground mb-4">
            Mulai dengan membuat kategori dan aspek evaluasi pertama.
          </p>
          <Button onClick={handleCreateNewCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Kategori Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayCategories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              aspects={aspectsByCategory[category] || []}
              categories={categories}
              onAddAspect={handleAddAspect}
              onEditAspect={handleEditAspect}
              onSaveAspect={handleSaveAspect}
              onDeleteAspect={handleDeleteAspect}
              editingAspectId={editingAspectId}
              newAspectCategory={newAspectCategory}
              onCancelEdit={handleCancelEdit}
              loading={saving}
            />
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 pt-6 border-t">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Kategori</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{aspects.length}</div>
            <div className="text-sm text-muted-foreground">Total Aspek</div>
          </div>
        </div>
      </div>
    </div>
  );
};