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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@workspace/ui/components/form';
import { BoardGroup, BoardGroupCreate, BoardGroupUpdate } from '@/services/board-members/types';

const boardGroupFormSchema = z.object({
  title: z.string().min(1, 'Nama grup wajib diisi').max(255, 'Nama grup maksimal 255 karakter'),
  display_order: z.number().min(1, 'Urutan minimal 1'),
  description: z.string().optional().or(z.literal('')),
});

type BoardGroupFormData = z.infer<typeof boardGroupFormSchema>;

interface BoardGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBoardGroup: BoardGroup | null;
  onSave: (data: BoardGroupCreate | BoardGroupUpdate) => void;
  mode?: 'create' | 'edit' | 'view';
}

export const BoardGroupDialog: React.FC<BoardGroupDialogProps> = ({
  open,
  onOpenChange,
  editingBoardGroup,
  onSave,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const form = useForm<BoardGroupFormData>({
    resolver: zodResolver(boardGroupFormSchema),
    defaultValues: {
      title: '',
      display_order: 1,
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingBoardGroup) {
        form.reset({
          title: editingBoardGroup.title,
          display_order: editingBoardGroup.display_order,
          description: editingBoardGroup.description || '',
        });
      } else {
        form.reset({
          title: '',
          display_order: 1,
          description: '',
        });
      }
    }
  }, [open, editingBoardGroup, form]);

  const onSubmit = async (data: BoardGroupFormData) => {
    setLoading(true);

    try {
      const submitData = {
        title: data.title,
        display_order: data.display_order,
        description: data.description || undefined,
      };

      await onSave(submitData);

      onOpenChange(false);
      form.reset();
      // Success message handled by parent page
    } catch (error: any) {
      console.error('Error saving board group:', error);
      toast({
        title: 'Terjadi kesalahan',
        description: error.message || 'Gagal menyimpan grup',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isView ? 'Detail Grup Dewan' : isEdit ? 'Edit Grup' : 'Tambah Grup Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Grup</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama grup"
                      {...field}
                      disabled={loading || isView}
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
                  <FormLabel>Urutan Tampil</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      onFocus={(e) => {
                        if (e.target.value === '1') {
                          e.target.select();
                        }
                      }}
                      disabled={loading || isView}
                    />
                  </FormControl>
                  <FormDescription>
                    Urutan tampil di website (1 = paling atas)
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
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Masukkan deskripsi grup (opsional)"
                      disabled={loading || isView}
                    />
                  </FormControl>
                  <FormDescription>
                    Deskripsi singkat tentang grup (opsional)
                  </FormDescription>
                  <FormMessage />
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