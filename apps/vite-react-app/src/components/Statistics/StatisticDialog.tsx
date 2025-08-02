import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@workspace/ui/components/form';
import FileUpload from '@/components/common/FileUpload';
import { Statistic, StatisticCreate, StatisticUpdate } from '@/services/statistics/types';

const statisticFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  description: z.string().optional().or(z.literal('')),
  stats: z.string().min(1, 'Nilai statistik wajib diisi').max(255, 'Nilai maksimal 255 karakter'),
  display_order: z.number().min(1, 'Urutan minimal 1').optional(),
});

type StatisticFormData = z.infer<typeof statisticFormSchema>;

interface StatisticDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStatistic: Statistic | null;
  onSave: (data: StatisticCreate | StatisticUpdate, image?: File) => void;
}

export const StatisticDialog: React.FC<StatisticDialogProps> = ({
  open,
  onOpenChange,
  editingStatistic,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isEdit = !!editingStatistic;

  const form = useForm<StatisticFormData>({
    resolver: zodResolver(statisticFormSchema),
    defaultValues: {
      title: '',
      description: '',
      stats: '',
      display_order: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingStatistic) {
        form.reset({
          title: editingStatistic.title,
          description: editingStatistic.description || '',
          stats: editingStatistic.stats,
          display_order: editingStatistic.display_order,
        });
      } else {
        form.reset({
          title: '',
          description: '',
          stats: '',
          display_order: undefined,
        });
      }
      setSelectedFiles([]);
    }
  }, [open, editingStatistic, form]);

  const handleSubmit = async (data: StatisticFormData) => {
    setLoading(true);
    try {
      const imageFile = selectedFiles.length > 0 ? selectedFiles[0] : undefined;
      
      await onSave({
        title: data.title,
        description: data.description || undefined,
        stats: data.stats,
        display_order: data.display_order,
      }, imageFile);
      
      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to save statistic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Statistik' : 'Tambah Statistik'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: Total Siswa" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai Statistik</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: 1,250 atau 85% atau 2.5km" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nilai bisa berupa angka dengan suffix seperti %, km, atau hanya angka biasa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Deskripsi singkat tentang statistik ini..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan Tampilan (Opsional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      placeholder="Biarkan kosong untuk otomatis"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Urutan untuk menampilkan statistik. Biarkan kosong untuk menggunakan urutan otomatis.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="block font-medium">
                Icon Statistik (Opsional)
              </label>
              <FileUpload
                accept="image/*"
                maxFiles={1}
                maxSize={5 * 1024 * 1024} // 5MB
                onFilesChange={handleFilesSelected}
                onFileRemove={handleFileRemove}
                files={selectedFiles}
                description="Upload icon untuk statistik (maksimal 5MB)"
              />
              {isEdit && editingStatistic?.img_url && selectedFiles.length === 0 && (
                <div className="mt-2">
                  <p className="text-muted-foreground">Icon saat ini:</p>
                  <img 
                    src={editingStatistic.img_url} 
                    alt={editingStatistic.title}
                    className="w-16 h-16 object-cover rounded mt-1"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};