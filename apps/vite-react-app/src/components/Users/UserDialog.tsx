import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { User, UserCreate, AdminUserUpdate } from '@/services/users/types';
import { UserRole, UserStatus } from '@/services/auth/types';

const userFormSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
  role: z.nativeEnum(UserRole, { required_error: 'Role wajib dipilih' }),
  status: z.nativeEnum(UserStatus).optional(),
  organization_id: z.number().optional(),
  password: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  onSave: (userData: UserCreate | AdminUserUpdate) => void;
}

export const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  editingUser,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!editingUser;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      address: '',
      position: '',
      role: UserRole.GURU,
      status: UserStatus.ACTIVE,
      organization_id: undefined,
      password: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingUser) {
        form.reset({
          email: editingUser.email,
          name: editingUser.profile?.name || '',
          phone: editingUser.profile?.phone || '',
          address: editingUser.profile?.address || '',
          position: editingUser.profile?.position || '',
          role: editingUser.role || UserRole.GURU,
          status: editingUser.status,
          organization_id: editingUser.organization_id,
          password: '', // Never pre-fill password
        });
      } else {
        form.reset({
          email: '',
          name: '',
          phone: '',
          address: '',
          position: '',
          role: UserRole.GURU,
          status: UserStatus.ACTIVE,
          organization_id: undefined,
          password: '',
        });
      }
    }
  }, [open, editingUser, form]);

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);

    try {
      if (isEdit) {
        // For edit, use AdminUserUpdate interface
        const updateData: AdminUserUpdate = {
          email: data.email,
          profile: {
            name: data.name,
            phone: data.phone || undefined,
            address: data.address || undefined,
            position: data.position || undefined,
          },
          status: data.status,
          organization_id: data.organization_id,
        };
        onSave(updateData);
      } else {
        // For create, use UserCreate interface
        const createData: UserCreate = {
          email: data.email,
          profile: {
            name: data.name,
            phone: data.phone || undefined,
            address: data.address || undefined,
            position: data.position || undefined,
          },
          password: data.password,
          organization_id: data.organization_id,
          // Status will be set to ACTIVE by service
        };
        onSave(createData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving user:', error);
      // Error handling delegated to parent component (UsersPage)
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
            {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex  flex-col gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
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

{!isEdit && (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                            <SelectItem value={UserRole.GURU}>Guru</SelectItem>
                            <SelectItem value={UserRole.KEPALA_SEKOLAH}>Kepala Sekolah</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isEdit && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserStatus.ACTIVE}>Aktif</SelectItem>
                            <SelectItem value={UserStatus.INACTIVE}>Tidak Aktif</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Masukkan password"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Pengguna' : 'Tambah Pengguna'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};