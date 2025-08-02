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
import { Program, ProgramCreate, ProgramUpdate } from '@/services/program/types';

const programFormSchema = z.object({
  title: z.string().min(1, 'Nama program wajib diisi').max(255, 'Nama program maksimal 255 karakter'),
  excerpt: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

type ProgramFormData = z.infer<typeof programFormSchema>;

interface ProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProgram: Program | null;
  onSave: (data: ProgramCreate | ProgramUpdate, image?: File) => void;
  mode?: 'create' | 'edit' | 'view';
}

export const ProgramDialog: React.FC<ProgramDialogProps> = ({
  open,
  onOpenChange,
  editingProgram,
  onSave,
  mode = 'create'
}) => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingProgram) {
        form.reset({
          title: editingProgram.title,
          excerpt: editingProgram.excerpt || '',
          description: editingProgram.description || '',
        });
      } else {
        form.reset({
          title: '',
          excerpt: '',
          description: '',
        });
      }
      setSelectedFiles([]);
    }
  }, [open, editingProgram, form]);

  const onSubmit = async (data: ProgramFormData) => {
    setLoading(true);

    try {
      const submitData = {
        title: data.title,
        excerpt: data.excerpt || undefined,
        description: data.description || undefined,
      };

      const imageFile = selectedFiles.length > 0 ? selectedFiles[0] : undefined;
      await onSave(submitData, imageFile);

      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);

      toastSuccess(isEdit ? 'Program berhasil diperbarui' : 'Program berhasil ditambahkan');
    } catch (error: any) {
      console.error('Error saving program:', error);
      toastError(error.message || 'Gagal menyimpan program');
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

  const existingFiles = editingProgram?.img_url ? [{
    name: `Current Image - ${editingProgram.title}`,
    url: editingProgram.img_url,
    viewUrl: editingProgram.img_url,
  }] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isView ? 'Detail Program' : isEdit ? 'Edit Program' : 'Tambah Program Baru'}
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
                    <FormLabel>Nama Program</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama program"
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
                  label="Gambar Program"
                  description="Upload gambar program (JPG, PNG, WebP, max 5MB)"
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
                        placeholder="Masukkan ringkasan program (opsional)"
                        rows={3}
                        {...field}
                        disabled={loading || isView}
                      />
                    </FormControl>
                    <FormDescription>
                      Ringkasan singkat tentang program (opsional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Detail</FormLabel>
                    <FormControl>
                      {isView ? (
                        <div className="min-h-[200px] p-3 border rounded-md bg-muted/30">
                          {field.value ? (
                            <RichTextDisplay content={field.value} />
                          ) : (
                            <span className="text-muted-foreground italic">Tidak ada deskripsi detail</span>
                          )}
                        </div>
                      ) : (
                        <RichTextEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Masukkan deskripsi detail program (opsional)"
                          disabled={loading}
                        />
                      )}
                    </FormControl>
                    <FormDescription>
                      Deskripsi lengkap tentang program, tujuan, manfaat, dll (opsional)
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