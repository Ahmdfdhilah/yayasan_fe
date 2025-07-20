import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@workspace/ui/components/sonner';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { changePasswordAsync } from '@/redux/features/authSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z
    .string()
    .min(6, 'Password baru minimal 6 karakter')
    .max(128, 'Password baru maksimal 128 karakter'),
  confirm_password: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirm_password'],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  loading?: boolean;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  loading: externalLoading
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = loading || externalLoading;
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    }
  });

  const watchNewPassword = form.watch('new_password');

  const getPasswordStrength = (password: string) => {
    const requirements = [
      { regex: /.{6,}/, label: 'Minimal 6 karakter' },
      { regex: /^.{1,128}$/, label: 'Maksimal 128 karakter' },
    ];

    return requirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));
  };

  const handleSubmit = async (data: ChangePasswordData) => {
    setLoading(true);
    try {
      await dispatch(changePasswordAsync({
        current_password: data.current_password,
        new_password: data.new_password
      })).unwrap();
      
      onSave();
      toast({
        title: 'Password berhasil diubah',
        description: 'Password Anda telah berhasil diperbarui.',
        variant: 'default'
      });
      
      form.reset();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Gagal mengubah password',
        description: error || 'Terjadi kesalahan saat mengubah password',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  const passwordRequirements = getPasswordStrength(watchNewPassword || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Ganti Password
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Saat Ini</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Masukkan password saat ini"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        disabled={isLoading}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Masukkan password baru"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Requirements */}
            {watchNewPassword && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Syarat Password:</p>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle 
                        className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} 
                      />
                      <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password Baru</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Konfirmasi password baru"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Security Tips */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Tips Keamanan:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Gunakan password yang sulit ditebak</li>
                <li>• Jangan gunakan informasi pribadi yang mudah ditebak</li>
                <li>• Ganti password secara berkala</li>
                <li>• Jangan bagikan password kepada siapa pun</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Mengubah...' : 'Ubah Password'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};