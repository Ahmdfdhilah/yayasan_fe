import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { confirmPasswordResetAsync } from '@/redux/features/authSlice';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';

import { useTheme } from '@/hooks/useTheme';
import logoLightMode from '@/assets/logoLightMode.png';
import logoDarkMode from '@/assets/logoDarkMode.png';
import loginIcon from '@/assets/loginIcon.png';

const resetPasswordSchema = z.object({
  new_password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(128, 'Password maksimal 128 karakter'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Password tidak cocok",
  path: ["confirm_password"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: ''
    }
  });

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  React.useEffect(() => {
    if (error) {
      setError('');
    }
  }, [form.watch()]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token reset password tidak valid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await dispatch(confirmPasswordResetAsync({ 
        token, 
        new_password: data.new_password 
      })).unwrap();
      
      navigate('/login', {
        state: { message: 'Password berhasil direset. Silakan login dengan password baru.' }
      });
    } catch (error: any) {
      setError(error || 'Terjadi kesalahan saat reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!token) {
    return null;
  }

  return (
    <div className="max-h-screen relative overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex max-h-screen">
        {/* Left Side - Banner Image */}
        <div className="flex-[2] relative bg-gray-100 dark:bg-gray-900">
          <img 
            src={loginIcon} 
            alt="Login Banner" 
            className="w-[80%] object-cover"
          />
        </div>

        {/* Right Side - Reset Password Form */}
        <div className="flex-1 flex items-center justify-center bg-background p-8">
          <div className="w-full max-w-md space-y-6">
            
            {/* Logo and Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img src={isDarkMode ? logoDarkMode : logoLightMode} alt="OKOCE HRIS" className="h-12 w-auto" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                <p className="text-muted-foreground">
                  Masukkan password baru Anda
                </p>
              </div>
            </div>

            {/* Reset Password Form */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Password Baru</CardTitle>
                <CardDescription>
                  Masukkan password baru yang aman untuk akun Anda
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    {/* Error Alert */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* New Password Field */}
                    <FormField
                      control={form.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Baru</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password baru"
                                disabled={loading}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                              >
                                {showPassword ? (
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

                    {/* Confirm Password Field */}
                    <FormField
                      control={form.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konfirmasi Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Konfirmasi password baru"
                                disabled={loading}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
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
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-4 mt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleBackToLogin}
                      disabled={loading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Login
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={isDarkMode ? logoDarkMode : logoLightMode} alt="OKOCE HRIS" className="h-12 w-auto" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
              <p className="text-white/80">
                Masukkan password baru Anda
              </p>
            </div>
          </div>

          {/* Reset Password Form */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Password Baru</CardTitle>
              <CardDescription>
                Masukkan password baru yang aman untuk akun Anda
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* New Password Field */}
                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Baru</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan password baru"
                              disabled={loading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={loading}
                            >
                              {showPassword ? (
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

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Konfirmasi password baru"
                              disabled={loading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={loading}
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
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 mt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToLogin}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}