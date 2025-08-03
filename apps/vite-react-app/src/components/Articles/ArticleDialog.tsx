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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import FileUpload from '@/components/common/FileUpload';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { Article, ArticleCreate, ArticleUpdate } from '@/services/articles/types';
import { articleService } from '@/services/articles';

const articleFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  slug: z.string().min(1, 'Slug wajib diisi').max(255, 'Slug maksimal 255 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung'),
  description: z.string().min(1, 'Konten wajib diisi'),
  excerpt: z.string().optional().or(z.literal('')),
  category: z.string().min(1, 'Kategori wajib diisi').max(100, 'Kategori maksimal 100 karakter'),
  is_published: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  onSave: (data: ArticleCreate | ArticleUpdate, image?: File) => void;
}

// Default article categories (fallback if API fails)
const DEFAULT_CATEGORIES = [
  'Berita',
  'Pengumuman',
  'Kegiatan',
  'Prestasi',
  'Akademik',
  'Ekstrakurikuler',
  'Umum',
];

export const ArticleDialog: React.FC<ArticleDialogProps> = ({
  open,
  onOpenChange,
  editingArticle,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const isEdit = !!editingArticle;

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      excerpt: '',
      category: '',
      is_published: false,
    },
  });

  // Fetch categories from API
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await articleService.getCategories();
      if (response.categories && response.categories.length > 0) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Keep default categories on error
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (editingArticle) {
        form.reset({
          title: editingArticle.title,
          slug: editingArticle.slug,
          description: editingArticle.description,
          excerpt: editingArticle.excerpt || '',
          category: editingArticle.category,
          is_published: editingArticle.is_published,
        });
        // Check if current category is in the list, if not, show custom input
        setCustomCategory('');
        setShowCustomInput(!categories.includes(editingArticle.category));
      } else {
        form.reset({
          title: '',
          slug: '',
          description: '',
          excerpt: '',
          category: '',
          is_published: false,
        });
        setCustomCategory('');
        setShowCustomInput(false);
      }
      setSelectedFiles([]);
    }
  }, [open, editingArticle, form, categories]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Watch title changes to auto-generate slug (always generate, even in edit mode)
  const watchTitle = form.watch('title');
  useEffect(() => {
    if (watchTitle) {
      const newSlug = generateSlug(watchTitle);
      form.setValue('slug', newSlug);
    }
  }, [watchTitle, form]);

  const onSubmit = async (data: ArticleFormData) => {
    // Validasi file upload untuk create
    if (!isEdit && selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Gambar artikel wajib diupload',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        excerpt: data.excerpt || undefined,
        category: data.category,
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : undefined,
      };

      const imageFile = selectedFiles.length > 0 ? selectedFiles[0] : undefined;
      await onSave(submitData, imageFile);

      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
      // Success message handled by parent page
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan artikel',
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
      title: 'Error',
      description: error,
      variant: 'destructive'
    });
  };

  const existingFiles = editingArticle?.img_url ? [{
    name: `Current Image - ${editingArticle.title}`,
    url: editingArticle.img_url,
    viewUrl: editingArticle.img_url,
  }] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Artikel</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan judul artikel"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug is auto-generated from title, no need to show input */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    {showCustomInput ? (
                      <div className="space-y-2">
                        <FormControl>
                          <Input
                            placeholder="Masukkan kategori baru"
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            disabled={loading}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomCategory('');
                            field.onChange('');
                          }}
                          disabled={loading}
                        >
                          Pilih dari daftar
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            if (value === '__custom__') {
                              setShowCustomInput(true);
                              setCustomCategory('');
                              field.onChange('');
                            } else {
                              field.onChange(value);
                            }
                          }} 
                          value={field.value}
                          disabled={loading || loadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingCategories ? "Memuat kategori..." : "Pilih kategori artikel"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="__custom__">
                              <span className="text-primary font-medium">+ Tambah kategori baru</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <FormDescription>
                      {showCustomInput 
                        ? "Masukkan nama kategori baru" 
                        : "Pilih kategori yang sudah ada atau tambah kategori baru"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div>
              <FileUpload
                label="Gambar Artikel"
                description="Upload gambar artikel (JPG, PNG, WebP, max 5MB)"
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                maxFiles={1}
                files={selectedFiles}
                existingFiles={existingFiles}
                onFilesChange={handleFilesChange}
                onError={handleFileError}
                required={!isEdit}
                disabled={loading}
                showPreview={true}
                allowRemove={false}
              />
            </div>

            {/* Excerpt */}
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ringkasan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan ringkasan artikel (opsional)"
                      rows={3}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Ringkasan singkat artikel yang akan ditampilkan di daftar artikel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten Artikel</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Masukkan konten lengkap artikel"
                      disabled={loading}
                      variant="full"
                      minHeight={300}
                    />
                  </FormControl>
                  <FormDescription>
                    Konten lengkap artikel dengan format rich text
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status Publikasi</FormLabel>
                    <FormDescription>
                      Artikel akan ditampilkan di website
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};