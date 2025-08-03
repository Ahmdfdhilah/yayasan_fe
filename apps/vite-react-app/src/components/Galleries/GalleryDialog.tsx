import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@workspace/ui/components/sonner';
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
import { Gallery, GalleryCreate, GalleryUpdate } from '@/services/galleries/types';
import { Switch } from '@workspace/ui/components/switch';

const galleryFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  excerpt: z.string().optional().or(z.literal('')),
  is_highlight: z.boolean(),
});

type GalleryFormData = z.infer<typeof galleryFormSchema>;

interface GalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGallery: Gallery | null;
  onSave: (data: GalleryCreate | GalleryUpdate, image?: File) => void;
}

export const GalleryDialog: React.FC<GalleryDialogProps> = ({
  open,
  onOpenChange,
  editingGallery,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isEdit = !!editingGallery;

  const form = useForm<GalleryFormData>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      is_highlight: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingGallery) {
        form.reset({
          title: editingGallery.title,
          excerpt: editingGallery.excerpt || '',
          is_highlight: editingGallery.is_highlight || false,
        });
      } else {
        form.reset({
          title: '',
          excerpt: '',
          is_highlight: false,
        });
      }
      setSelectedFiles([]);
    }
  }, [open, editingGallery, form]);

  const onSubmit = async (data: GalleryFormData) => {
    // Validasi file upload untuk create
    if (!isEdit && selectedFiles.length === 0) {
      toast({
        title: 'Validasi gagal',
        description: 'Gambar wajib diupload untuk galeri baru',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        title: data.title,
        excerpt: data.excerpt || undefined,
        is_highlight: data.is_highlight,
      };

      const imageFile = selectedFiles.length > 0 ? selectedFiles[0] : undefined;
      await onSave(submitData, imageFile);
      
      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
      // Success message handled by parent page
    } catch (error: any) {
      console.error('Error saving gallery:', error);
      toast({
        title: 'Terjadi kesalahan',
        description: error.message || 'Gagal menyimpan galeri',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileError = (error: string) => {
    toast({
      title: 'Error file',
      description: error,
      variant: 'destructive'
    });
  };

  const existingFiles = editingGallery?.img_url ? [{
    name: `Current Image - ${editingGallery.title}`,
    url: editingGallery.img_url,
    viewUrl: editingGallery.img_url,
  }] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Galeri' : 'Tambah Galeri Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <div>
              <FileUpload
                label="Gambar Galeri"
                description="Upload gambar galeri (JPG, PNG, WebP, max 5MB)"
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                maxFiles={1}
                files={selectedFiles}
                existingFiles={existingFiles}
                onFilesChange={handleFilesChange}
                onError={handleFileError}
                disabled={loading}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan judul galeri" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Masukkan deskripsi galeri (opsional)" disabled={loading} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_highlight"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Jadikan galeri unggulan
                    </FormLabel>
                    <FormDescription>
                      Galeri unggulan akan ditampilkan di posisi teratas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Galeri' : 'Buat Galeri'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};