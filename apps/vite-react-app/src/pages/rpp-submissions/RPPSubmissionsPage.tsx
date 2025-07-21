import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { 
  RPPSubmissionResponse,
  RPPSubmissionStatus,
  RPPSubmissionFilterParams
} from '@/services/rpp-submissions/types';
import { Organization } from '@/services/organizations/types';
import { Period } from '@/services/periods/types';
import { rppSubmissionService, organizationService, periodService } from '@/services';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { RPPSubmissionTable } from '@/components/RPPSubmissions/RPPSubmissionTable';
import { RPPSubmissionCards } from '@/components/RPPSubmissions/RPPSubmissionCards';
import { GenerateRPPDialog } from '@/components/RPPSubmissions';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';

interface RPPSubmissionsPageFilters {
  search: string;
  organization_id: string;
  period_id: string;
  status: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const RPPSubmissionsPage: React.FC = () => {
  const { currentRole, isAdmin, isKepalaSekolah } = useRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect guru to my-rpp-submissions
  if (currentRole === 'guru') {
    return <Navigate to="/my-rpp-submissions" replace />;
  }

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<RPPSubmissionsPageFilters>({
    defaults: {
      search: '',
      organization_id: 'all',
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Check access
  const hasAccess = isAdmin() || isKepalaSekolah();

  // Fetch submissions function
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // Build parameters
      let params: RPPSubmissionFilterParams = {
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

      // Auto-filter by organization for kepala sekolah, or allow admin to choose
      // Note: This will be handled by backend based on user permissions

      const response = await rppSubmissionService.getSubmissions(params);
      setSubmissions(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error: any) {
      console.error('Error loading RPP submissions:', error);
      const errorMessage = error?.message || 'Gagal memuat data RPP submissions. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load organizations (only for admin)
  const loadOrganizations = async () => {
    if (isAdmin()) {
      try {
        const response = await organizationService.getOrganizations();
        setOrganizations(response.items || []);
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    }
  };

  // Load periods
  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods();
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    if (hasAccess) {
      loadOrganizations();
      loadPeriods();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess) {
      fetchSubmissions();
    }
  }, [filters.page, filters.size, filters.search, filters.organization_id, filters.period_id, filters.status, hasAccess]);

  // Pagination
  const totalPages = Math.ceil(totalItems / filters.size);

  const handleViewSubmission = (submission: RPPSubmissionResponse) => {
    // Navigate to submission detail page with teacher ID and period ID in URL
    navigate(`/rpp-submissions/teacher/${submission.teacher_id}?period_id=${submission.period_id}`);
  };

  const handleReviewSubmission = async (submission: RPPSubmissionResponse) => {
    // Navigate to detail for review with teacher ID and period ID in URL
    navigate(`/rpp-submissions/teacher/${submission.teacher_id}?period_id=${submission.period_id}&review=true`);
  };

  const handleItemsPerPageChange = (value: string) => {
    updateURL({ size: parseInt(value), page: 1 });
  };

  // Filter handlers
  const handleSearchChange = (search: string) => {
    updateURL({ search, page: 1 });
  };

  const handleOrganizationChange = (organization_id: string) => {
    updateURL({ organization_id, page: 1 });
  };

  const handlePeriodChange = (period_id: string) => {
    updateURL({ period_id, page: 1 });
  };

  const handleStatusChange = (status: string) => {
    updateURL({ status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Handle successful generation - refresh the list
  const handleGenerateSuccess = async () => {
    await fetchSubmissions();
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "RPP Submissions";
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
    
    if (isAdmin() && filters.organization_id !== 'all') {
      const org = organizations.find(o => o.id === Number(filters.organization_id));
      if (org) {
        activeFilters.push(org.name);
      }
    } else if (isKepalaSekolah()) {
      activeFilters.push("Organisasi Saya");
    }
    
    if (activeFilters.length > 0) {
      title += " - " + activeFilters.join(" - ");
    }
    
    return title;
  };

  // Check access after hooks
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="RPP Submissions"
        description="Kelola dan review RPP submissions dari semua guru"
        actions={
          isAdmin() && (
            <GenerateRPPDialog
              periods={periods}
              onSuccess={handleGenerateSuccess}
            />
          )
        }
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="period-filter">Periode</Label>
          <Select value={filters.period_id} onValueChange={handlePeriodChange}>
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
          <Select value={filters.status} onValueChange={handleStatusChange}>
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

        {/* Only show organization filter for admin */}
        {isAdmin() && (
          <div className="space-y-2">
            <Label htmlFor="organization-filter">Organisasi</Label>
            <Select value={filters.organization_id} onValueChange={handleOrganizationChange}>
              <SelectTrigger id="organization-filter">
                <SelectValue placeholder="Filter berdasarkan organisasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Organisasi</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola dan review RPP submissions dari semua guru"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari berdasarkan nama guru..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <RPPSubmissionTable
                submissions={submissions}
                loading={loading}
                onView={handleViewSubmission}
                onSubmit={handleReviewSubmission}
                userRole={isAdmin() ? 'admin' : 'kepala_sekolah'}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <RPPSubmissionCards
                submissions={submissions}
                loading={loading}
                onView={handleViewSubmission}
                onSubmit={handleReviewSubmission}
                userRole={isAdmin() ? 'admin' : 'kepala_sekolah'}
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

export default RPPSubmissionsPage;