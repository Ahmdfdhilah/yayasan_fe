import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useToast } from '@workspace/ui/components/sonner';
import { periodService } from '@/services';

const MyRPPSubmissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, isGuru } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect non-guru users to appropriate page
  if (currentRole === 'admin' || currentRole === 'kepala_sekolah') {
    return <Navigate to="/rpp-submissions" replace />;
  }

  // Check access first
  if (!isGuru()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Halaman ini hanya untuk guru.
          </p>
        </div>
      </div>
    );
  }

  // Redirect logic
  useEffect(() => {
    const redirectToActiveSubmission = async () => {
      if (!user?.id) {
        console.error('User ID not available');
        return;
      }

      try {
        // Get active period
        const activePeriod = await periodService.getActivePeriod();
        
        if (activePeriod?.id) {
          // Redirect to submission detail page with current user and active period
          navigate(`/rpp-submissions/teacher/${user.id}?period_id=${activePeriod.id}`, { replace: true });
        } else {
          // No active period found
          toast({
            title: 'Periode Tidak Aktif',
            description: 'Belum ada periode yang aktif saat ini. Hubungi administrator.',
            variant: 'destructive'
          });
        }
      } catch (error: any) {
        console.error('Error getting active period:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil periode aktif. Silakan coba lagi.',
          variant: 'destructive'
        });
      }
    };

    if (user?.id) {
      redirectToActiveSubmission();
    }
  }, [user?.id, navigate, toast]);

  // Loading state while redirecting
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Mengalihkan ke RPP submission Anda...</p>
      </div>
    </div>
  );
};

export default MyRPPSubmissionsPage;