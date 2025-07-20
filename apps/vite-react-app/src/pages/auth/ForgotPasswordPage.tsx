import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { requestPasswordResetAsync } from '@/redux/features/authSlice';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';

import { useTheme } from '@/hooks/useTheme';
import logoLightMode from '@/assets/logoLightMode.png';
import logoDarkMode from '@/assets/logoDarkMode.png';
import loginIcon from '@/assets/loginIcon.png';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: location.state?.username || '',
    }
  });

  React.useEffect(() => {
    if (error) {
      setError('');
    }
  }, [form.watch()]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError('');

    try {
      await dispatch(requestPasswordResetAsync({ email: data.email })).unwrap();
      navigate('/callback', {
        state: { email: data.email }
      });
    } catch (error: any) {
      setError(error || 'Terjadi kesalahan saat mengirim email reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

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

        {/* Right Side - Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center bg-background p-8">
          <div className="w-full max-w-md space-y-6">
            
            {/* Logo and Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img src={isDarkMode ? logoDarkMode : logoLightMode} alt="OKOCE HRIS" className="h-12 w-auto" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Lupa Password</h1>
                <p className="text-muted-foreground">
                  Masukkan email Anda untuk mendapatkan link reset password
                </p>
              </div>
            </div>

            {/* Forgot Password Form */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription>
                  Kami akan mengirimkan link reset password ke email Anda
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

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              disabled={loading}
                              {...field}
                            />
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
                          Mengirim...
                        </>
                      ) : (
                        'Kirim Link Reset Password'
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
              <h1 className="text-2xl font-bold tracking-tight text-white">Lupa Password</h1>
              <p className="text-white/80">
                Masukkan email Anda untuk mendapatkan link reset password
              </p>
            </div>
          </div>

          {/* Forgot Password Form */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Reset Password</CardTitle>
              <CardDescription>
                Kami akan mengirimkan link reset password ke email Anda
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

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            disabled={loading}
                            {...field}
                          />
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
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Link Reset Password'
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