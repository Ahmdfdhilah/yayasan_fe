import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, UserUpdate } from '@/services/users/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';

const editProfileSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
});

type EditProfileData = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (data: UserUpdate) => void;
  loading?: boolean;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSave,
  loading = false
}) => {
  const form = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      nama: user.nama,
      jabatan: user.jabatan,
      email: user.email || '',
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        nama: user.nama,
        jabatan: user.jabatan,
        email: user.email || '',
      });
    }
  }, [open, user, form]);

  const onSubmit = (data: EditProfileData) => {
    const updateData: UserUpdate = {
      nama: data.nama,
      jabatan: data.jabatan,
      email: data.email || undefined,
    };
    onSave(updateData);
  };

  const getInitials = () => {
    const nameParts = user.nama.split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0][0] + nameParts[1][0];
    }
    return nameParts[0][0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Avatar */}
              <div className="flex justify-center mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama lengkap"
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
                  name="jabatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan jabatan"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Opsional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Masukkan email"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {user.username}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {user.role_display}
                  </div>
                </div>

                {user.inspektorat && (
                  <div className="space-y-2">
                    <Label>Inspektorat</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {user.inspektorat}
                    </div>
                  </div>
                )}

              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};