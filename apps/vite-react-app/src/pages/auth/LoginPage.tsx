// apps/vite-react-app/src/pages/auth/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';
import { Checkbox } from '@workspace/ui/components/checkbox';

import { useAuth } from '@/components/Auth/AuthProvider';
import logo from '@/assets/logo.png';
import bgImage from '@/assets/bg.webp';

const loginSchema = z.object({
  email: z.string().email('Valid email is required').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false)
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isAuthenticated, loading: authLoading, error, clearAuthError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { toast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';
  const message = location.state?.message || '';

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Update local error state when auth error changes (toast handled in onSubmit)
  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  // Set success message if provided and show toast
  useEffect(() => {
    if (message) {
      setSuccessMessage(message);
      toast({
        title: 'Informasi',
        description: message,
        variant: 'default'
      });
    }
  }, [message, toast]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  // Clear errors and success message when form values change
  useEffect(() => {
    if (loginError) {
      setLoginError('');
      clearAuthError();
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  }, [form.watch(), clearAuthError, loginError, successMessage]);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');
    clearAuthError();

    try {
      await login({
        email: data.email,
        password: data.password
      });

      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Navigation will be handled by useEffect when isAuthenticated becomes true
    } catch (error: any) {
      // Redux Toolkit unwrap() throws the rejectWithValue directly as string
      console.error('Login failed:', error);

      // Error from unwrap() is the string from rejectWithValue
      const errorMessage = typeof error === 'string' ? error : (error?.message || 'Terjadi kesalahan saat login');

      toast({
        title: 'Login Gagal',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password', {
      state: { email: form.getValues('email') }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Side - Background Image + Overlay + System Info */}
        <div className="w-[70%] relative bg-gray-100 dark:bg-gray-900">
          <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          {/* Gradient overlays at edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          <div className="absolute top-8 left-8 text-white flex items-center space-x-4">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Yayasan Baitul Muslim Lampung Timur</h2>
              <p className="text-white/90 max-w-md">
                Yayasan pendidikan dan dakwah Islam yang menyelenggarakan pendidikan terpadu berkualitas sejak 1993
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-[30%] flex items-center justify-center bg-background p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Logo and Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Selamat Datang</h1>
                <p className="text-muted-foreground">
                  Login dengan Email yang terdaftar untuk masuk ke sistem PKG Yayasan
                </p>
              </div>
            </div>

            {/* Login Form */}
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Login</CardTitle>
                <CardDescription>
                  Masukan email dan password untuk akses akun
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    {/* Error Alert */}
                    {loginError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {loginError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Success Alert */}
                    {successMessage && (
                      <Alert>
                        <AlertDescription>
                          {successMessage}
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
                              placeholder="Masukkan email"
                              disabled={authLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Masukkan password"
                                disabled={authLoading}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={authLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={authLoading}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Ingat saya
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 h-auto font-normal"
                        onClick={handleForgotPassword}
                        disabled={authLoading}
                      >
                        Lupa password?
                      </Button>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-4 mt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Masuk...
                        </>
                      ) : (
                        'Masuk'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Selamat Datang</h1>
              <p className="text-muted-foreground">
                Login dengan Email yang terdaftar untuk masuk ke sistem PKG Yayasan
              </p>
            </div>
          </div>

          {/* Login Form */}
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Login</CardTitle>
              <CardDescription>
                Masukan email dan password untuk akses akun
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* Error Alert */}
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {loginError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success Alert */}
                  {successMessage && (
                    <Alert>
                      <AlertDescription>
                        {successMessage}
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
                            placeholder="Masukkan email"
                            disabled={authLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Masukkan password"
                              disabled={authLoading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={authLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={authLoading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Ingat saya
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="px-0 h-auto font-normal"
                      onClick={handleForgotPassword}
                      disabled={authLoading}
                    >
                      Lupa password?
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 mt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Masuk...
                      </>
                    ) : (
                      'Masuk'
                    )}
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