import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Switch } from '@workspace/ui/components/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@workspace/ui/components/form';
import { Gallery, GalleryCreate, GalleryUpdate } from '@/services/galleries/types';

const galleryFormSchema = z.object({
  img_url: z.string().min(1, 'URL gambar wajib diisi').url('URL gambar tidak valid'),
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  excerpt: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
  display_order: z.number().min(0, 'Urutan tidak boleh negatif'),
});

type GalleryFormData = z.infer<typeof galleryFormSchema>;

interface GalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGallery: Gallery | null;
  onSave: (data: GalleryCreate | GalleryUpdate) => void;
}

export const GalleryDialog: React.FC<GalleryDialogProps> = ({
  open, onOpenChange, editingGallery, onSave
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!editingGallery;

  const form = useForm<GalleryFormData>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      img_url: '',
      title: '',
      excerpt: '',
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingGallery) {
        form.reset({
          img_url: editingGallery.img_url,
          title: editingGallery.title,
          excerpt: editingGallery.excerpt || '',
          is_active: editingGallery.is_active,
          display_order: editingGallery.display_order,
        });
      } else {
        form.reset({
          img_url: '',
          title: '',
          excerpt: '',
          is_active: true,
          display_order: 0,
        });
      }
    }
  }, [open, editingGallery, form]);

  const onSubmit = async (data: GalleryFormData) => {
    setLoading(true);
    try {
      const submitData = {
        img_url: data.img_url,
        title: data.title,
        excerpt: data.excerpt || undefined,
        is_active: data.is_active,
        display_order: data.display_order,
      };
      onSave(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Galeri' : 'Tambah Galeri Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="img_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Gambar</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urutan Tampilan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Urutan tampilan galeri (0 = paling atas)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status Aktif</FormLabel>
                      <FormDescription>Galeri akan ditampilkan di website</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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