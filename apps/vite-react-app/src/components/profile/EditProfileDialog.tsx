import React, { useEffect, useState } from 'react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Camera } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

const editProfileSchema = z.object({
  email: z.string().email('Format email tidak valid').min(1, 'Email wajib diisi'),
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
  onSave: (data: UserUpdate, imageFile?: File) => void;
  loading?: boolean;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSave,
  loading = false
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      email: user.email || '',
      name: user.profile?.name || user.display_name || '',
      phone: user.profile?.phone || '',
      address: user.profile?.address || '',
      position: user.profile?.position || '',
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        email: user.email || '',
        name: user.profile?.name || user.display_name || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        position: user.profile?.position || '',
      });
      // Reset image selection when dialog opens
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  }, [open, user, form]);

  const handleImageSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: EditProfileData) => {
    const updateData: UserUpdate = {
      email: data.email,
      profile: {
        ...user.profile, // Preserve other existing profile fields
        name: data.name,
        phone: data.phone || undefined,
        address: data.address || undefined,
        position: data.position || undefined,
      },
    };
    onSave(updateData, selectedImage || undefined);
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
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    {previewUrl ? (
                      <AvatarImage src={previewUrl} alt="Preview" />
                    ) : user.img_url ? (
                      <AvatarImage src={getImageUrl(user.img_url)} alt={user.display_name} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {getInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                    disabled={loading}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files)}
                />
                
                {selectedImage && (
                  <p className="text-xs text-muted-foreground">
                    Foto baru dipilih: {selectedImage.name}
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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