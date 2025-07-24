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
import FileUpload from '@/components/common/FileUpload';
import { BoardMember, BoardMemberCreate, BoardMemberUpdate } from '@/services/board-members/types';

const boardMemberFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama maksimal 255 karakter'),
  position: z.string().min(1, 'Posisi wajib diisi').max(255, 'Posisi maksimal 255 karakter'),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
  display_order: z.number().min(0, 'Urutan tidak boleh negatif'),
});

type BoardMemberFormData = z.infer<typeof boardMemberFormSchema>;

interface BoardMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBoardMember: BoardMember | null;
  onSave: (data: BoardMemberCreate | BoardMemberUpdate, image?: File) => void;
}

export const BoardMemberDialog: React.FC<BoardMemberDialogProps> = ({
  open,
  onOpenChange,
  editingBoardMember,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isEdit = !!editingBoardMember;

  const form = useForm<BoardMemberFormData>({
    resolver: zodResolver(boardMemberFormSchema),
    defaultValues: {
      name: '',
      position: '',
      description: '',
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingBoardMember) {
        form.reset({
          name: editingBoardMember.name,
          position: editingBoardMember.position,
          description: editingBoardMember.description || '',
          is_active: editingBoardMember.is_active,
          display_order: editingBoardMember.display_order,
        });
      } else {
        form.reset({
          name: '',
          position: '',
          description: '',
          is_active: true,
          display_order: 0,
        });
      }
      setSelectedFiles([]);
    }
  }, [open, editingBoardMember, form]);

  const onSubmit = async (data: BoardMemberFormData) => {
    // Validasi file upload untuk create
    if (!isEdit && selectedFiles.length === 0) {
      toast.error({ title: 'Gambar wajib diupload untuk pengurus baru' });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: data.name,
        position: data.position,
        description: data.description || undefined,
        is_active: data.is_active,
        display_order: data.display_order,
      };

      const imageFile = selectedFiles.length > 0 ? selectedFiles[0] : undefined;
      await onSave(submitData, imageFile);
      
      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
      
      toast.success({ title: isEdit ? 'Pengurus berhasil diperbarui' : 'Pengurus berhasil ditambahkan' });
    } catch (error: any) {
      console.error('Error saving board member:', error);
      toast.error({ title: error.message || 'Gagal menyimpan pengurus' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileError = (error: string) => {
    toast.error({ title: error });
  };

  const existingFiles = editingBoardMember?.img_url ? [{
    name: `Current Image - ${editingBoardMember.name}`,
    url: editingBoardMember.img_url,
    viewUrl: editingBoardMember.img_url,
  }] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posisi/Jabatan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan posisi/jabatan"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div>
              <FileUpload
                label="Foto Pengurus"
                description="Upload foto pengurus (JPG, PNG, WebP, max 5MB)"
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
                    <Textarea
                      placeholder="Masukkan deskripsi pengurus (opsional)"
                      rows={4}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Deskripsi singkat tentang pengurus (opsional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status Aktif</FormLabel>
                      <FormDescription>
                        Pengurus akan ditampilkan di website
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

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urutan Tampil</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Urutan tampil di website (0 = paling atas)
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