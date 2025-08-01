import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { requestPasswordResetAsync } from '@/redux/features/authSlice';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

import logo from '@/assets/logo.png';
import bgImage from '@/assets/bg.webp';

export function EmailSentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const email = location.state?.email || '';

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = async () => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    setResending(true);
    setError('');
    setSuccess('');

    try {
      await dispatch(requestPasswordResetAsync({ email })).unwrap();
      setSuccess('Email telah dikirim ulang!');
    } catch (error: any) {
      setError(error || 'Terjadi kesalahan saat mengirim ulang email');
    } finally {
      setResending(false);
    }
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
              <h2 className="text-2xl font-bold mb-2">Sistem Informasi Yayasan Baitul Muslim Lampung Timur</h2>
              <p className="text-white/90 max-w-md">
                Yayasan pendidikan dan dakwah Islam yang menyelenggarakan pendidikan terpadu berkualitas sejak 1993
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-[30%] flex items-center justify-center bg-background p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Logo and Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Email Terkirim!</h1>
                <p className="text-muted-foreground">
                  Link reset password telah dikirim ke email Anda
                </p>
              </div>
            </div>

            {/* Success Card */}
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Email Berhasil Dikirim</CardTitle>
                <CardDescription className="text-center">
                  Kami telah mengirimkan link reset password ke email Anda
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Success Alert */}
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Link reset password telah dikirim ke{' '}
                    <span className="font-semibold">{email}</span>
                  </AlertDescription>
                </Alert>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert for Resend */}
                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Silakan cek email Anda dan klik link yang diberikan untuk reset password.</p>
                  <p>Jika Anda tidak menerima email dalam beberapa menit, cek folder spam atau junk mail.</p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 mt-4">
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Ulang Email'
                  )}
                </Button>
              </CardFooter>
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
              <h1 className="text-3xl font-bold tracking-tight">Email Terkirim!</h1>
              <p className="text-muted-foreground">
                Link reset password telah dikirim ke email Anda
              </p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-center">Email Berhasil Dikirim</CardTitle>
              <CardDescription className="text-center">
                Kami telah mengirimkan link reset password ke email Anda
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Success Alert */}
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Link reset password telah dikirim ke{' '}
                  <span className="font-semibold">{email}</span>
                </AlertDescription>
              </Alert>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert for Resend */}
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground space-y-2">
                <p>Silakan cek email Anda dan klik link yang diberikan untuk reset password.</p>
                <p>Jika Anda tidak menerima email dalam beberapa menit, cek folder spam atau junk mail.</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button
                type="button"
                className="w-full"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendEmail}
                disabled={resending}
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Ulang Email'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}