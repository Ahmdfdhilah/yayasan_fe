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
import { Switch } from '@workspace/ui/components/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@workspace/ui/components/form';
import { Article, ArticleCreate, ArticleUpdate } from '@/services/articles/types';

const articleFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  slug: z.string().min(1, 'Slug wajib diisi').max(255, 'Slug maksimal 255 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung'),
  description: z.string().min(1, 'Konten wajib diisi'),
  excerpt: z.string().optional().or(z.literal('')),
  img_url: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  category: z.string().min(1, 'Kategori wajib diisi').max(100, 'Kategori maksimal 100 karakter'),
  is_published: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  onSave: (data: ArticleCreate | ArticleUpdate) => void;
}

export const ArticleDialog: React.FC<ArticleDialogProps> = ({
  open,
  onOpenChange,
  editingArticle,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!editingArticle;

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      excerpt: '',
      img_url: '',
      category: '',
      is_published: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingArticle) {
        form.reset({
          title: editingArticle.title,
          slug: editingArticle.slug,
          description: editingArticle.description,
          excerpt: editingArticle.excerpt || '',
          img_url: editingArticle.img_url || '',
          category: editingArticle.category,
          is_published: editingArticle.is_published,
        });
      } else {
        form.reset({
          title: '',
          slug: '',
          description: '',
          excerpt: '',
          img_url: '',
          category: '',
          is_published: false,
        });
      }
    }
  }, [open, editingArticle, form]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const onSubmit = async (data: ArticleFormData) => {
    setLoading(true);

    try {
      const submitData = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        excerpt: data.excerpt || undefined,
        img_url: data.img_url || undefined,
        category: data.category,
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : undefined,
      };

      onSave(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan Artikel. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle>
            {isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan judul artikel"
                            disabled={loading}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate slug if not editing
                              if (!isEdit && e.target.value) {
                                form.setValue('slug', generateSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="artikel-slug"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          URL-friendly identifier (huruf kecil, angka, dan tanda hubung)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan kategori artikel"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="img_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Gambar</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          URL gambar utama artikel (opsional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ringkasan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan ringkasan artikel (opsional)"
                          disabled={loading}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ringkasan singkat yang akan ditampilkan di daftar artikel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konten</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan konten lengkap artikel"
                          disabled={loading}
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Konten lengkap artikel (mendukung HTML)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publikasikan Artikel</FormLabel>
                        <FormDescription>
                          Artikel akan ditampilkan di website publik
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
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Artikel' : 'Buat Artikel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};