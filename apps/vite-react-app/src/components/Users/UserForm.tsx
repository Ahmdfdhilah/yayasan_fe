import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/services/users/types';
import { USER_ROLES, ROLE_LABELS, INSPEKTORAT_OPTIONS } from '@/lib/constants';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';

const userSchema = z.object({
  nama: z.string().min(1, 'Nama is required').min(2, 'Nama must be at least 2 characters').max(200),
  jabatan: z.string().min(1, 'Jabatan is required').max(200),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.INSPEKTORAT, USER_ROLES.PERWADAG], {
    required_error: 'Please select a role',
  }),
  inspektorat: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'view' | 'edit' | 'create';
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
}) => {
  const [showInspektoratSelect, setShowInspektoratSelect] = useState(
    initialData?.role === USER_ROLES.INSPEKTORAT || USER_ROLES.PERWADAG || false
  );

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama: initialData?.nama || '',
      jabatan: initialData?.jabatan || '',
      email: initialData?.email || '',
      is_active: initialData?.is_active ?? true,
      role: initialData?.role || USER_ROLES.PERWADAG,
      inspektorat: initialData?.inspektorat || '',
    }
  });

  useEffect(() => {
    const role = form.watch('role');

    setShowInspektoratSelect(role === USER_ROLES.INSPEKTORAT || USER_ROLES.PERWADAG);

    if (role !== USER_ROLES.INSPEKTORAT) {
      form.setValue('inspektorat', '');
    }
  }, [form.watch('role')]);


  const handleSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama lengkap" disabled={loading || disabled} {...field} />
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
                  <Input placeholder="Masukkan jabatan" disabled={loading || disabled} {...field} />
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
                  <Input type="email" placeholder="Masukkan alamat email" disabled={loading || disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {/* Role and Status */}
        <div className="grid grid-cols-1  gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading || disabled}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.ADMIN}>{ROLE_LABELS[USER_ROLES.ADMIN]}</SelectItem>
                    <SelectItem value={USER_ROLES.INSPEKTORAT}>{ROLE_LABELS[USER_ROLES.INSPEKTORAT]}</SelectItem>
                    <SelectItem value={USER_ROLES.PERWADAG}>{ROLE_LABELS[USER_ROLES.PERWADAG]}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {/* Inspektorat Selection */}
        {showInspektoratSelect && (
          <FormField
            control={form.control}
            name="inspektorat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspektorat</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading || disabled}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih inspektorat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INSPEKTORAT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading || disabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Status Aktif
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading || disabled}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || disabled}>
            {loading ? 'Menyimpan...' : initialData ? 'Update User' : 'Buat User'}
          </Button>
        </div>
      </form>
    </Form>
  );
};