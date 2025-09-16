import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { useToast } from '@workspace/ui/components/sonner';
import { rppSubmissionService } from '@/services';
import { RPPSubmissionItemResponse } from '@/services/rpp-submissions/types';

const editItemSchema = z.object({
  name: z.string()
    .min(1, 'Nama submission item harus diisi')
    .max(255, 'Nama terlalu panjang (maksimal 255 karakter)'),
  description: z.string()
    .max(1000, 'Deskripsi terlalu panjang (maksimal 1000 karakter)')
    .optional(),
});

type EditItemFormData = z.infer<typeof editItemSchema>;

interface EditRPPItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RPPSubmissionItemResponse;
  onSuccess: () => void;
}

export const EditRPPItemDialog: React.FC<EditRPPItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSuccess,
}) => {
  const { toast } = useToast();
  
  const form = useForm<EditItemFormData>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description || '',
    },
  });

  const { handleSubmit, control, reset, formState: { isSubmitting } } = form;

  // Reset form when item changes or dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        name: item.name,
        description: item.description || '',
      });
    }
  }, [open, item, reset]);

  const onSubmit = async (data: EditItemFormData) => {
    try {
      console.log('Updating RPP item with:', { itemId: item.id, data });
      const result = await rppSubmissionService.updateRPPSubmissionItemDetails(item.id, {
        name: data.name,
        description: data.description || null,
      });
      console.log('Submission item updated successfully:', result);

      toast({
        title: 'Berhasil',
        description: 'Submission item berhasil diperbarui.',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating submission item:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui submission item. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Submission Item</DialogTitle>
          <DialogDescription>
            Ubah nama dan deskripsi Submission item ini.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Submission *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Modul Matematika Kelas 7"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat mengenai submission ini..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};