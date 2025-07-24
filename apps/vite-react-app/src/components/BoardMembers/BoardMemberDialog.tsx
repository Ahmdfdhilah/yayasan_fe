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
import { BoardMember, BoardMemberCreate, BoardMemberUpdate } from '@/services/board-members/types';

const boardMemberFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama maksimal 255 karakter'),
  position: z.string().min(1, 'Posisi wajib diisi').max(255, 'Posisi maksimal 255 karakter'),
  img_url: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
  display_order: z.number().min(0, 'Urutan tidak boleh negatif'),
});

type BoardMemberFormData = z.infer<typeof boardMemberFormSchema>;

interface BoardMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBoardMember: BoardMember | null;
  onSave: (data: BoardMemberCreate | BoardMemberUpdate) => void;
}

export const BoardMemberDialog: React.FC<BoardMemberDialogProps> = ({
  open,
  onOpenChange,
  editingBoardMember,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!editingBoardMember;

  const form = useForm<BoardMemberFormData>({
    resolver: zodResolver(boardMemberFormSchema),
    defaultValues: {
      name: '',
      position: '',
      img_url: '',
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
          img_url: editingBoardMember.img_url || '',
          description: editingBoardMember.description || '',
          is_active: editingBoardMember.is_active,
          display_order: editingBoardMember.display_order,
        });
      } else {
        form.reset({
          name: '',
          position: '',
          img_url: '',
          description: '',
          is_active: true,
          display_order: 0,
        });
      }
    }
  }, [open, editingBoardMember, form]);

  const onSubmit = async (data: BoardMemberFormData) => {
    setLoading(true);

    try {
      const submitData = {
        name: data.name,
        position: data.position,
        img_url: data.img_url || undefined,
        description: data.description || undefined,
        is_active: data.is_active,
        display_order: data.display_order,
      };

      onSave(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving board member:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan Anggota Dewan. Silakan coba lagi.',
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle>
            {isEdit ? 'Edit Anggota Dewan' : 'Tambah Anggota Dewan Baru'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama anggota dewan"
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
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posisi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan posisi/jabatan"
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
                      <FormLabel>URL Foto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/photo.jpg"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL foto profil anggota dewan (opsional)
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
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan deskripsi atau bio anggota dewan (opsional)"
                          disabled={loading}
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <FormDescription>
                          Urutan tampilan anggota dewan (0 = paling atas)
                        </FormDescription>
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
                          <FormDescription>
                            Anggota dewan akan ditampilkan di website
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
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Anggota Dewan' : 'Buat Anggota Dewan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};