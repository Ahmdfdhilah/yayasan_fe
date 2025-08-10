import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Organization } from '@/services/organizations/types';
import { organizationService, periodService, teacherEvaluationService } from '@/services';
import { Period } from '@/services/periods/types';
import {
  TeacherEvaluationResponse,
  TeacherEvaluationFilterParams
} from '@/services/teacher-evaluations/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import {
  AssignTeachersToPeriodDialog,
  TeacherEvaluationTable,
  TeacherEvaluationCards
} from '@/components/TeacherEvaluations';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';

interface EvaluationPageFilters {
  search: string;
  period_id: string;
  organization_id: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const TeacherEvaluationsPage: React.FC = () => {
  const { currentRole, isAdmin, isKepalaSekolah } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect guru to my-evaluations
  if (currentRole === 'guru') {
    return <Navigate to="/my-evaluations" replace />;
  }

  // Get current user info for organization filtering (not used currently but might be needed for future org filtering)
  // const currentUser = useSelector((state: RootState) => state.auth.user);

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<EvaluationPageFilters>({
    defaults: {
      search: '',
      period_id: 'active',
      organization_id: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();

  const [evaluations, setEvaluations] = useState<TeacherEvaluationResponse[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Check access
  const hasAccess = isAdmin() || isKepalaSekolah();

  // Fetch teacher evaluations function
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const params: TeacherEvaluationFilterParams = {
        skip: (filters.page - 1) * filters.size,
        limit: filters.size,
      };

      // Period filtering - only allow active period for non-admin users
      if (filters.period_id === 'active' && activePeriod) {
        params.period_id = activePeriod.id;
      } else if (filters.period_id !== 'active' && isAdmin()) {
        // Only admin can view other periods
        params.period_id = Number(filters.period_id);
      } else if (!isAdmin()) {
        // Non-admin users can only see active period
        params.period_id = activePeriod?.id;
      }

      // Handle search filter
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      // Organization filtering for admin only
      if (isAdmin() && filters.organization_id !== 'all') {
        params.organization_id = Number(filters.organization_id);
      }

      const response = await teacherEvaluationService.getTeacherEvaluationsFiltered(params);
      setEvaluations(response.items || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.pages || 0);
    } catch (error: any) {
      console.error('Error loading evaluations:', error);
      const errorMessage = error?.message || 'Gagal memuat data evaluasi. Silakan coba lagi.';
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
      const response = await periodService.getPeriods({ page: 1, size: 100 });
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  // Load active period
  const loadActivePeriod = async () => {
    try {
      const activeResponse = await periodService.getActivePeriod();
      setActivePeriod(activeResponse);
    } catch (error) {
      console.error('Error loading active period:', error);
      // If no active period, try to find one manually
      try {
        const allPeriodsResponse = await periodService.getPeriods({ is_active: true, page: 1, size: 100 });
        const activePeriods = allPeriodsResponse.items || [];
        if (activePeriods.length > 0) {
          setActivePeriod(activePeriods[0]);
        }
      } catch (fallbackError) {
        console.error('Error in fallback active period load:', fallbackError);
      }
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    if (hasAccess) {
      loadOrganizations();
      loadPeriods();
      loadActivePeriod();
    }
  }, [hasAccess]);

  // Auto-select active period if no period is selected or if "active" is selected
  useEffect(() => {
    if (activePeriod && (filters.period_id === 'active' || !filters.period_id)) {
      updateURL({ period_id: activePeriod.id.toString() });
    }
  }, [activePeriod]);

  // Effect to fetch evaluations when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchEvaluations();
    }
  }, [filters.page, filters.size, filters.search, filters.period_id, filters.organization_id, hasAccess]);

  // Pagination handled by totalPages state

  const handleViewEvaluation = (evaluation: TeacherEvaluationResponse) => {
    // Navigate to evaluation detail page using teacher_id, with period_id from current filters
    const currentPeriodId = filters.period_id === 'active' && activePeriod ? activePeriod.id : filters.period_id;
    const teacherId = evaluation.teacher_id || evaluation.teacher?.id;
    navigate(`/teacher-evaluations/${teacherId}?period_id=${currentPeriodId}`);
  };

  const handleEditEvaluation = (evaluation: TeacherEvaluationResponse) => {
    // Navigate to evaluation detail page in edit mode
    const currentPeriodId = filters.period_id === 'active' && activePeriod ? activePeriod.id : filters.period_id;
    const teacherId = evaluation.teacher_id || evaluation.teacher?.id;
    navigate(`/teacher-evaluations/${teacherId}?period_id=${currentPeriodId}&edit=true`);
  };

  // Check if user can edit specific evaluation
  const canEditEvaluation = (evaluation: TeacherEvaluationResponse) => {
    // Must be in active period
    if (!activePeriod || evaluation.period_id !== activePeriod.id) {
      return false;
    }

    if (isAdmin()) {
      return true;
    }

    if (isKepalaSekolah()) {
      // Kepala sekolah can only edit evaluations in their organization
      return evaluation.teacher?.organization_id === user?.organization_id;
    }

    return false;
  };


  const handleAssignSuccess = () => {
    fetchEvaluations(); // Refresh the evaluations list
  };

  const handleItemsPerPageChange = (value: string) => {
    updateURL({ size: parseInt(value), page: 1 });
  };

  // Filter handlers
  const handleSearchChange = useCallback((search: string) => {
    if (search !== filters.search) {
      updateURL({ search, page: 1 });
    }
  }, [updateURL, filters.search]);

  const handlePeriodChange = useCallback((period_id: string) => {
    if (period_id !== filters.period_id) {
      updateURL({ period_id, page: 1 });
    }
  }, [updateURL, filters.period_id]);

  const handleOrganizationChange = useCallback((organization_id: string) => {
    if (organization_id !== filters.organization_id) {
      updateURL({ organization_id, page: 1 });
    }
  }, [updateURL, filters.organization_id]);

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Evaluasi Guru";
    const activeFilters = [];

    // Period filter
    if (filters.period_id === 'active') {
      activeFilters.push("Periode Aktif");
    } else if (isAdmin() && filters.period_id !== 'active') {
      const period = periods.find(p => p.id === Number(filters.period_id));
      if (period) {
        activeFilters.push(`${period.academic_year} - ${period.semester}`);
      }
    }

    // Organization filter (admin only)
    if (isAdmin() && filters.organization_id !== 'all') {
      const org = organizations.find(o => o.id === Number(filters.organization_id));
      if (org) {
        activeFilters.push(org.name);
      }
    } else if (isKepalaSekolah()) {
      activeFilters.push("Sekolah Saya");
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
        title="Evaluasi Guru"
        description="Daftar evaluasi kinerja guru berdasarkan periode dan Sekolah"
        actions={
          isAdmin() && (
            <AssignTeachersToPeriodDialog
              activePeriod={activePeriod}
              onSuccess={handleAssignSuccess}
            />
          )
        }
      />

      {/* Filtering */}
      <Filtering>
        {/* Period Filter */}
        <div className="space-y-2">
          <Label htmlFor="period-filter">Periode</Label>
          <Select value={filters.period_id} onValueChange={handlePeriodChange}>
            <SelectTrigger id="period-filter">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  {period.academic_year} - {period.semester}
                  {period.is_active ? ' (Aktif)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organization Filter (Admin only) */}
        {isAdmin() && (
          <div className="space-y-2">
            <Label htmlFor="organization-filter">Sekolah</Label>
            <Select value={filters.organization_id} onValueChange={handleOrganizationChange}>
              <SelectTrigger id="organization-filter">
                <SelectValue placeholder="Filter berdasarkan Sekolah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sekolah</SelectItem>
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
              subtitle="Daftar evaluasi kinerja guru berdasarkan periode dan Sekolah"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari berdasarkan nama guru..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <TeacherEvaluationTable
                evaluations={evaluations}
                loading={loading}
                onView={handleViewEvaluation}
                onEdit={handleEditEvaluation}
                canEdit={canEditEvaluation}
                userRole={currentRole as any}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <TeacherEvaluationCards
                evaluations={evaluations}
                loading={loading}
                onView={handleViewEvaluation}
                onEdit={handleEditEvaluation}
                canEdit={canEditEvaluation}
                userRole={currentRole as any}
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

export default TeacherEvaluationsPage;