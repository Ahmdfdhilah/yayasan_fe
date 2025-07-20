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
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
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
      name: user.profile?.name || user.display_name || '',
      phone: user.profile?.phone || '',
      address: user.profile?.address || '',
      position: user.profile?.position || '',
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.profile?.name || user.display_name || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        position: user.profile?.position || '',
      });
    }
  }, [open, user, form]);

  const onSubmit = (data: EditProfileData) => {
    const updateData: UserUpdate = {
      profile: {
        ...user.profile, // Preserve other existing profile fields
        name: data.name,
        phone: data.phone || undefined,
        address: data.address || undefined,
        position: data.position || undefined,
      },
    };
    onSave(updateData);
  };

  const getInitials = () => {
    const name = user.profile?.name || user.display_name || 'N';
    const nameParts = name.split(' ');
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
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="name"
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
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posisi/Jabatan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan posisi atau jabatan"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nomor telepon"
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
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan alamat lengkap"
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
              <div className="grid grid-cols-1  gap-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {user.id}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Roles</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {user.roles?.join(', ') || 'Tidak ada role'}
                  </div>
                </div>

                {user.organization_id && (
                  <div className="space-y-2">
                    <Label>Organisasi ID</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {user.organization_id}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {user.status}
                  </div>
                </div>
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