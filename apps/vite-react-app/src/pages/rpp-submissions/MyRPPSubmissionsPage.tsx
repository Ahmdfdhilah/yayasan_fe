import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import {
  RPPSubmissionResponse,
  RPPSubmissionStatus,
} from '@/services/rpp-submissions/types';
import { Period } from '@/services/periods/types';
import { rppSubmissionService, periodService } from '@/services';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';
import { RPPSubmissionTable } from '@/components/RPPSubmissions/RPPSubmissionTable';
import { RPPSubmissionCards } from '@/components/RPPSubmissions/RPPSubmissionCards';

interface MyRPPSubmissionsPageFilters {
  period_id: string;
  status: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const MyRPPSubmissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, isGuru } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect non-guru users to appropriate page
  if (currentRole === 'admin' || currentRole === 'kepala_sekolah') {
    return <Navigate to="/rpp-submissions" replace />;
  }

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<MyRPPSubmissionsPageFilters>({
    defaults: {
      period_id: 'all',
      status: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();

  const [submissions, setSubmissions] = useState<RPPSubmissionResponse[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Check access
  const hasAccess = isGuru();

  useEffect(() => {
    if (hasAccess) {
      loadPeriods();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess && user?.id && periods.length > 0) {
      loadMySubmissions();
    }
  }, [filters.page, filters.size, filters.period_id, filters.status, hasAccess, user?.id, periods.length]);

  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods();
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  const loadMySubmissions = async () => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }

    try {
      setLoading(true);

      // Build parameters
      let params: any = {
        limit: filters.size,
        offset: (filters.page - 1) * filters.size,
      };

      // Handle period filter
      if (filters.period_id !== 'all') {
        params.period_id = Number(filters.period_id);
      }

      // Handle status filter
      if (filters.status !== 'all') {
        params.status = filters.status as RPPSubmissionStatus;
      }

      const response = await rppSubmissionService.getMySubmissions(params);

      setSubmissions(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error: any) {
      console.error('Error loading my RPP submissions:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data RPP submissions. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodFilterChange = (period_id: string) => {
    updateURL({ period_id, page: 1 });
  };

  const handleStatusFilterChange = (status: string) => {
    updateURL({ status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const handleItemsPerPageChange = (value: string) => {
    const size = parseInt(value, 10);
    updateURL({ size, page: 1 });
  };

  const handleView = (submission: RPPSubmissionResponse) => {
    // Navigate to submission detail page with teacher ID and period ID in URL
    navigate(`/rpp-submissions/teacher/${submission.teacher_id}?period_id=${submission.period_id}`);
  };

  const handleSubmit = async (submission: RPPSubmissionResponse) => {
    if (!rppSubmissionService.isSubmissionReady(submission)) {
      toast({
        title: 'Tidak dapat submit',
        description: 'Pastikan semua RPP telah diupload sebelum submit.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await rppSubmissionService.submitForApproval(submission.id);
      toast({
        title: 'Berhasil',
        description: 'RPP submission berhasil disubmit untuk review.',
      });
      loadMySubmissions(); // Refresh data
    } catch (error: any) {
      console.error('Error submitting RPP:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal submit RPP submission.',
        variant: 'destructive'
      });
    }
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "RPP Submissions Saya";
    const activeFilters = [];

    if (filters.status !== 'all') {
      const statusLabels = {
        draft: 'Draft',
        pending: 'Menunggu Review',
        approved: 'Disetujui',
        rejected: 'Ditolak',
      };
      activeFilters.push(statusLabels[filters.status as keyof typeof statusLabels]);
    }

    if (filters.period_id !== 'all') {
      const period = periods.find(p => p.id === Number(filters.period_id));
      if (period) {
        activeFilters.push(`${period.academic_year} - ${period.semester}`);
      }
    }

    if (activeFilters.length > 0) {
      title += " - " + activeFilters.join(" - ");
    }

    return title;
  };

  const totalPages = Math.ceil(totalItems / filters.size);

  // Check access after hooks
  if (!hasAccess) {
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

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="RPP Submissions Saya"
        description="Kelola dan submit RPP (Rencana Pelaksanaan Pembelajaran) Anda untuk setiap periode"
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="period-filter">Periode</Label>
          <Select value={filters.period_id} onValueChange={handlePeriodFilterChange}>
            <SelectTrigger id="period-filter">
              <SelectValue placeholder="Filter berdasarkan periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  {period.academic_year} - {period.semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filters.status} onValueChange={handleStatusFilterChange}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Menunggu Review</SelectItem>
              <SelectItem value="APPROVED">Disetujui</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola dan submit RPP (Rencana Pelaksanaan Pembelajaran) Anda untuk setiap periode"
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <RPPSubmissionTable
                submissions={submissions}
                loading={loading}
                onView={handleView}
                onSubmit={handleSubmit}
                userRole="guru"
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <RPPSubmissionCards
                submissions={submissions}
                loading={loading}
                onView={handleView}
                onSubmit={handleSubmit}
                userRole="guru"
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                itemsPerPage={filters.size}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyRPPSubmissionsPage;