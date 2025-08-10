import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useToast } from '@workspace/ui/components/sonner';
import { periodService } from '@/services';

const MyEvaluationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isGuru, isKepalaSekolah } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check access first
  if (!isGuru() && !isKepalaSekolah()) {
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
    const redirectToActiveEvaluation = async () => {
      if (!user?.id) {
        console.error('User ID not available');
        return;
      }

      try {
        // Get active period
        const activePeriod = await periodService.getActivePeriod();

        if (activePeriod?.id) {
          // Redirect to teacher evaluation page with current user and active period
          navigate(`/teacher-evaluations/${user.id}?period_id=${activePeriod.id}`);
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
      redirectToActiveEvaluation();
    }
  }, [user?.id, navigate, toast]);

  // Loading state while redirecting
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Mengalihkan ke evaluasi Anda...</p>
      </div>
    </div>
  );
};

export default MyEvaluationsPage;