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
  EvaluationCategory,
  EvaluationCategoryCreate,
  EvaluationCategoryUpdate,
  CategoryWithAspectsResponse,
} from '@/services/evaluation-aspects/types';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

export const EvaluationAspectsPage: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin } = useRole();

  const [categoriesWithAspects, setCategoriesWithAspects] = useState<CategoryWithAspectsResponse[]>([]);
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAspectId, setEditingAspectId] = useState<number | null>(null);
  const [newAspectCategoryId, setNewAspectCategoryId] = useState<number | null>(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle category drag end
  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldItems = categoriesWithAspects;
      
      // Optimistic update
      setCategoriesWithAspects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      
      try {
        setIsReordering(true);
        // Update category order in backend
        const newOrder = arrayMove(oldItems, 
          oldItems.findIndex((item) => item.id === active.id),
          oldItems.findIndex((item) => item.id === over.id)
        );
        
        // Call API for each category with new order
        await Promise.all(
          newOrder.map((category, index) => 
            evaluationAspectService.updateCategoryOrder({
              category_id: category.id,
              new_order: index + 1
            })
          )
        );
        
        toast({
          title: 'Berhasil',
          description: 'Urutan kategori berhasil diperbarui.',
        });
      } catch (error: any) {
        console.error('Error updating category order:', error);
        
        // Rollback on error
        setCategoriesWithAspects(oldItems);
        
        toast({
          title: 'Error',
          description: error?.message || 'Gagal memperbarui urutan kategori.',
          variant: 'destructive'
        });
      } finally {
        setIsReordering(false);
      }
    }
  };

  // Dialog states
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState<EvaluationCategoryCreate>({
    name: '',
    description: '',
  });
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

      // Get all categories
      const categoriesData = await evaluationAspectService.getCategories();
      setCategories(categoriesData);

      // Get each category with its aspects
      const categoriesWithAspectsData = await Promise.all(
        categoriesData.map(category => 
          evaluationAspectService.getCategoryWithAspects(category.id)
        )
      );

      setCategoriesWithAspects(categoriesWithAspectsData);
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

  const handleAddAspect = (categoryId: number) => {
    setEditingAspectId(null);
    setNewAspectCategoryId(categoryId);
  };

  const handleEditAspect = (aspect: EvaluationAspect) => {
    setNewAspectCategoryId(null);
    setEditingAspectId(aspect.id);
  };

  const handleCancelEdit = () => {
    setEditingAspectId(null);
    setNewAspectCategoryId(null);
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

        // Update aspect in the category's aspects list
        setCategoriesWithAspects(prev =>
          prev.map(cat => ({
            ...cat,
            aspects: cat.aspects.map(aspect =>
              aspect.id === aspectId ? updatedAspect : aspect
            )
          }))
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

        // This case is handled above in the category update

        // Update the category's aspects list
        setCategoriesWithAspects(prev =>
          prev.map(cat =>
            cat.id === newAspect.category_id
              ? { ...cat, aspects: [...cat.aspects, newAspect] }
              : cat
          )
        );

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

      // Remove aspect from the category's aspects list
      setCategoriesWithAspects(prev =>
        prev.map(cat => ({
          ...cat,
          aspects: cat.aspects.filter(aspect => aspect.id !== aspectToDelete.id)
        }))
      );

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
    setNewCategoryData({ name: '', description: '' });
    setShowCreateCategoryDialog(true);
  };

  const confirmCreateCategory = async () => {
    if (newCategoryData.name && newCategoryData.name.trim()) {
      try {
        setSaving(true);
        
        const createdCategory = await evaluationAspectService.createCategory({
          ...newCategoryData,
          name: newCategoryData.name.trim()
        });
        
        setCategories(prev => [...prev, createdCategory]);
        setCategoriesWithAspects(prev => [...prev, {
          ...createdCategory,
          aspects: []
        }]);
        
        handleAddAspect(createdCategory.id);
        setShowCreateCategoryDialog(false);
        setNewCategoryData({ name: '', description: '' });
        
        toast({
          title: 'Berhasil',
          description: 'Kategori baru berhasil dibuat.',
        });
      } catch (error: any) {
        console.error('Error creating category:', error);
        toast({
          title: 'Error',
          description: error?.message || 'Gagal membuat kategori baru.',
          variant: 'destructive'
        });
      } finally {
        setSaving(false);
      }
    }
  };

  // Handle category update
  const handleUpdateCategory = async (categoryId: number, data: EvaluationCategoryUpdate) => {
    try {
      setSaving(true);
      
      const updatedCategory = await evaluationAspectService.updateCategory(categoryId, data);
      
      // Update categories list
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? updatedCategory : cat
        )
      );
      
      // Update categoriesWithAspects list
      setCategoriesWithAspects(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, name: updatedCategory.name, description: updatedCategory.description }
            : cat
        )
      );
      
      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil diperbarui.',
      });
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal memperbarui kategori.',
        variant: 'destructive'
      });
      throw error; // Re-throw untuk handling di component
    } finally {
      setSaving(false);
    }
  };

  // Handle category delete
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setSaving(true);
      
      await evaluationAspectService.deleteCategory(categoryId);
      
      // Remove category from both lists
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setCategoriesWithAspects(prev => prev.filter(cat => cat.id !== categoryId));
      
      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil dihapus.',
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal menghapus kategori.',
        variant: 'destructive'
      });
      throw error; // Re-throw untuk handling di component
    } finally {
      setSaving(false);
    }
  };

  // Display all categories
  const displayCategoriesWithAspects = categoriesWithAspects.filter(category => 
    category.aspects.length > 0 || newAspectCategoryId === category.id
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
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsEditMode(!isEditMode)}
              variant={isEditMode ? "default" : "outline"}
            >
              {isEditMode ? 'Selesai Edit' : 'Edit Aspek Evaluasi'}
            </Button>
            
            {isEditMode && (
              <Button onClick={handleCreateNewCategory} disabled={saving}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Bagian Baru
              </Button>
            )}
          </div>
        }
      />


      {/* Form Content - Google Forms style with drag & drop */}
      {displayCategoriesWithAspects.length === 0 ? (
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
          {isEditMode ? (
            /* Drag & Drop Mode with @dnd-kit */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCategoryDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              {isReordering && (
                <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan urutan...
                </div>
              )}
              <SortableContext
                items={displayCategoriesWithAspects.map(cat => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6">
                  {displayCategoriesWithAspects.map((categoryWithAspects, index) => (
                    <motion.div
                      key={categoryWithAspects.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CategorySection
                        key={categoryWithAspects.id}
                        category={categoryWithAspects}
                        aspects={categoryWithAspects.aspects}
                        categories={categories}
                        onAddAspect={handleAddAspect}
                        onEditAspect={handleEditAspect}
                        onSaveAspect={handleSaveAspect}
                        onDeleteAspect={(aspect) => handleDeleteAspect(aspect)}
                        editingAspectId={editingAspectId}
                        newAspectCategoryId={newAspectCategoryId}
                        onCancelEdit={handleCancelEdit}
                        loading={saving}
                        sectionNumber={index + 1}
                        isEditMode={isEditMode}
                        onUpdateCategory={handleUpdateCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onAspectReorder={async (aspectId, newIndex) => {
                          const oldCategoriesWithAspects = categoriesWithAspects;
                          
                          // Optimistic update
                          setCategoriesWithAspects(prev =>
                            prev.map(cat =>
                              cat.id === categoryWithAspects.id
                                ? {
                                    ...cat,
                                    aspects: arrayMove(
                                      cat.aspects,
                                      cat.aspects.findIndex(a => a.id === aspectId),
                                      newIndex
                                    )
                                  }
                                : cat
                            )
                          );
                          
                          try {
                            setIsReordering(true);
                            // Call API to update aspect order
                            const category = categoriesWithAspects.find(cat => cat.id === categoryWithAspects.id);
                            if (category) {
                              const newAspectsOrder = arrayMove(
                                category.aspects,
                                category.aspects.findIndex(a => a.id === aspectId),
                                newIndex
                              );
                              
                              // Update aspect orders in category
                              const aspectOrders = newAspectsOrder.reduce((acc, aspect, index) => {
                                acc[aspect.id] = index + 1;
                                return acc;
                              }, {} as Record<number, number>);
                              
                              await evaluationAspectService.reorderAspectsInCategory({
                                category_id: categoryWithAspects.id,
                                aspect_orders: aspectOrders
                              });
                              
                              toast({
                                title: 'Berhasil',
                                description: 'Urutan aspek berhasil diperbarui.',
                              });
                            }
                          } catch (error: any) {
                            console.error('Error updating aspect order:', error);
                            
                            // Rollback on error
                            setCategoriesWithAspects(oldCategoriesWithAspects);
                            
                            toast({
                              title: 'Error',
                              description: error?.message || 'Gagal memperbarui urutan aspek.',
                              variant: 'destructive'
                            });
                          } finally {
                            setIsReordering(false);
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {displayCategoriesWithAspects.map((categoryWithAspects, index) => (
                <motion.div
                  key={categoryWithAspects.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <CategorySection
                    key={categoryWithAspects.id}
                    category={categoryWithAspects}
                    aspects={categoryWithAspects.aspects}
                    categories={categories}
                    onAddAspect={handleAddAspect}
                    onEditAspect={handleEditAspect}
                    onSaveAspect={handleSaveAspect}
                    onDeleteAspect={(aspect) => handleDeleteAspect(aspect)}
                    editingAspectId={editingAspectId}
                    newAspectCategoryId={newAspectCategoryId}
                    onCancelEdit={handleCancelEdit}
                    loading={saving}
                    sectionNumber={index + 1}
                    isEditMode={isEditMode}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Section Button - only in edit mode */}
          {isEditMode && (
            <motion.div 
              className="flex justify-center mt-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleCreateNewCategory}
                disabled={saving}
                variant="outline"
                className="border-dashed border-2 hover:border-primary hover:bg-primary/5 py-3 px-6"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tambah Bagian
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Bagian Baru</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <Input
                placeholder="Nama bagian (contoh: Kompetensi Pedagogik)"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    confirmCreateCategory();
                  }
                }}
                autoFocus
              />
              <Input
                placeholder="Deskripsi bagian (opsional)"
                value={newCategoryData.description || ''}
                onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateCategoryDialog(false);
                setNewCategoryData({ name: '', description: '' });
              }}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              onClick={confirmCreateCategory}
              disabled={!newCategoryData.name.trim() || saving}
            >
              {saving ? 'Membuat...' : 'Buat Bagian'}
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