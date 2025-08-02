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
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
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
import { Mitra, MitraCreate, MitraUpdate } from '@/services/mitra/types';

const mitraFormSchema = z.object({
  title: z.string().min(1, 'Nama mitra wajib diisi').max(255, 'Nama mitra maksimal 255 karakter'),
  description: z.string().optional().or(z.literal('')),
});

type MitraFormData = z.infer<typeof mitraFormSchema>;

interface MitraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMitra: Mitra | null;
  onSave: (data: MitraCreate | MitraUpdate, image?: File) => void;
  mode?: 'create' | 'edit' | 'view';
}

export const MitraDialog: React.FC<MitraDialogProps> = ({
  open,
  onOpenChange,
  editingMitra,
  onSave,
  mode = 'create'
}) => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const form = useForm<MitraFormData>({
    resolver: zodResolver(mitraFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingMitra) {
        form.reset({
          title: editingMitra.title,
          description: editingMitra.description || '',
        });
      } else {
        form.reset({
          title: '',
          description: '',
        });
      }
      setSelectedFiles([]);
    }
  }, [open, editingMitra, form]);

  const onSubmit = async (data: MitraFormData) => {
    setLoading(true);

    try {
      const submitData = {
        title: data.title,
        description: data.description || undefined,
      };

      const imageFile = selectedFiles.length > 0 ? selectedFiles[0] : undefined;
      await onSave(submitData, imageFile);

      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);

      toastSuccess(isEdit ? 'Mitra berhasil diperbarui' : 'Mitra berhasil ditambahkan');
    } catch (error: any) {
      console.error('Error saving mitra:', error);
      toastError(error.message || 'Gagal menyimpan mitra');
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileError = (error: string) => {
    toastError(error);
  };

  const existingFiles = editingMitra?.img_url ? [{
    name: `Current Image - ${editingMitra.title}`,
    url: editingMitra.img_url,
    viewUrl: editingMitra.img_url,
  }] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isView ? 'Detail Mitra' : isEdit ? 'Edit Mitra' : 'Tambah Mitra Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Mitra</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama mitra"
                        {...field}
                        disabled={loading || isView}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div>
                <FileUpload
                  label="Logo/Gambar Mitra"
                  description="Upload logo atau gambar mitra (JPG, PNG, WebP, max 5MB)"
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                  maxFiles={1}
                  files={selectedFiles}
                  existingFiles={existingFiles}
                  onFilesChange={handleFilesChange}
                  onError={handleFileError}
                  required={false}
                  disabled={loading || isView}
                  showPreview={true}
                  allowRemove={true}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      {isView ? (
                        <div className="min-h-[100px] p-3 border rounded-md bg-muted/30">
                          {field.value ? (
                            <RichTextDisplay content={field.value} />
                          ) : (
                            <span className="text-muted-foreground italic">Tidak ada deskripsi</span>
                          )}
                        </div>
                      ) : (
                        <RichTextEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Masukkan deskripsi mitra (opsional)"
                          disabled={loading}
                        />
                      )}
                    </FormControl>
                    <FormDescription>
                      Deskripsi singkat tentang mitra (opsional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {isView ? 'Tutup' : 'Batal'}
              </Button>
              {!isView && (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};