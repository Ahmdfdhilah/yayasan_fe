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

const createItemSchema = z.object({
  name: z.string()
    .min(1, 'Nama submission item harus diisi')
    .max(255, 'Nama terlalu panjang (maksimal 255 karakter)'),
  description: z.string()
    .max(1000, 'Deskripsi terlalu panjang (maksimal 1000 karakter)')
    .optional(),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

interface CreateRPPItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: number;
  onSuccess: () => void;
}

export const CreateRPPItemDialog: React.FC<CreateRPPItemDialogProps> = ({
  open,
  onOpenChange,
  periodId,
  onSuccess,
}) => {
  const { toast } = useToast();
  
  const form = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { handleSubmit, control, reset, formState: { isSubmitting } } = form;

  const onSubmit = async (data: CreateItemFormData) => {
    try {
      console.log('Creating RPP item with:', { periodId, data });
      const result = await rppSubmissionService.createRPPSubmissionItem(periodId, {
        name: data.name,
        description: data.description || null,
      });
      console.log('RPP item created successfully:', result);

      toast({
        title: 'Berhasil',
        description: 'Submission item berhasil dibuat.',
      });

      reset();
      onOpenChange(false);
      console.log('Calling onSuccess callback...');
      onSuccess();
    } catch (error) {
      console.error('Error creating submission item:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat submission item. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Submission Item Baru</DialogTitle>
          <DialogDescription>
            Buat item Submission baru untuk periode ini. Anda bisa mengupload file nanti.
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
                      placeholder="Contoh: TP[Nomor]_[Mata Pelajaran][Kelas]"
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
                {isSubmitting ? 'Membuat...' : 'Buat Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};