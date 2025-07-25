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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Combobox } from '@workspace/ui/components/combobox';
import FileUpload from '@/components/common/FileUpload';
import { Organization, OrganizationCreate, OrganizationUpdate } from '@/services/organizations/types';
import { User } from '@/services/users/types';
import { userService } from '@/services/users';

const organizationFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama maksimal 255 karakter'),
  description: z.string().optional().or(z.literal('')),
  excerpt: z.string().optional().or(z.literal('')),
  head_id: z.number().optional().or(z.literal('')),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrganization: Organization | null;
  onSave: (data: OrganizationCreate | OrganizationUpdate, image?: File) => void;
}

export const OrganizationDialog: React.FC<OrganizationDialogProps> = ({
  open,
  onOpenChange,
  editingOrganization,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isEdit = !!editingOrganization;

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      description: '',
      excerpt: '',
      head_id: undefined,
    },
  });

  // Load users for head selection
  const loadUsers = async (search: string = '') => {
    setUsersLoading(true);
    try {
      const response = await userService.getUsers({
        search,
        size: 50, // Limit for combobox
        page: 1,
      });
      setUsers(response.items);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data pengguna untuk pemilihan kepala.',
        variant: 'destructive'
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (editingOrganization) {
        form.reset({
          name: editingOrganization.name,
          description: editingOrganization.description || '',
          excerpt: editingOrganization.excerpt || '',
          head_id: editingOrganization.head_id,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          excerpt: '',
          head_id: undefined,
        });
      }
      // Reset search and load initial users
      setSearchValue('');
      setSelectedFiles([]);
      loadUsers();
    }
  }, [open, editingOrganization, form]);

  const onSubmit = async (data: OrganizationFormData) => {
    setLoading(true);

    try {
      const submitData = {
        name: data.name,
        description: data.description || undefined,
        excerpt: data.excerpt || undefined,
        head_id: data.head_id || undefined,
      };

      const imageFile = selectedFiles.length > 0 ? selectedFiles[0] : undefined;
      onSave(submitData, imageFile);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving organization:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan Sekolah. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      form.reset();
      setSearchValue('');
      setSelectedFiles([]);
      onOpenChange(false);
    }
  };

  // Prepare users for combobox
  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.profile?.name || user.display_name} (${user.email})`,
  }));

  const handleUserSearch = async (search: string) => {
    setSearchValue(search);
    await loadUsers(search);
  };

  const handleUserSelect = (value: string | number) => {
    const userId = typeof value === 'string' ? parseInt(value) : value;
    form.setValue('head_id', userId);
  };

  const selectedUser = users.find(user => user.id === form.getValues('head_id'));

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileError = (error: string) => {
    toast({
      title: 'Error',
      description: error,
      variant: 'destructive'
    });
  };

  const existingFiles = editingOrganization?.img_url ? [{
    name: `Current Image - ${editingOrganization.name}`,
    url: editingOrganization.img_url,
    viewUrl: editingOrganization.img_url,
  }] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle>
            {isEdit ? 'Edit Sekolah' : 'Tambah Sekolah Baru'}
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
                      <FormLabel>Nama Sekolah</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama Sekolah"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Lengkap</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Masukkan deskripsi lengkap sekolah (opsional)"
                          disabled={loading}
                          variant="default"
                          minHeight={150}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ringkasan Singkat</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan ringkasan singkat sekolah (opsional)"
                          disabled={loading}
                          rows={2}
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div>
                  <FileUpload
                    label="Gambar Sekolah"
                    description="Upload gambar sekolah (JPG, PNG, WebP, max 5MB)"
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    maxFiles={1}
                    files={selectedFiles}
                    existingFiles={existingFiles}
                    onFilesChange={handleFilesChange}
                    onError={handleFileError}
                    required={false}
                    disabled={loading}
                    showPreview={true}
                    allowRemove={true}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="head_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Kepala Sekolah</FormLabel>
                      <FormControl>
                        <Combobox
                          options={userOptions}
                          value={selectedUser ? selectedUser.id : null}
                          onChange={handleUserSelect}
                          placeholder="Cari dan pilih kepala Sekolah..."
                          emptyMessage="Tidak ada pengguna ditemukan"
                          searchPlaceholder="Cari pengguna..."
                          searchValue={searchValue}
                          onSearchChange={handleUserSearch}
                          isLoading={usersLoading}
                        />
                      </FormControl>
                      <FormMessage />
                      {selectedUser && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Dipilih: {selectedUser.profile?.name || selectedUser.display_name} ({selectedUser.email})
                        </div>
                      )}
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
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Sekolah' : 'Buat Sekolah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};