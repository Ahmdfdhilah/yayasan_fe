import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
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
  skip: number;
  limit: number;
  [key: string]: string | number;
}

const TeacherEvaluationsPage: React.FC = () => {
  const { currentRole, isAdmin, isKepalaSekolah } = useRole();
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
      skip: 0,
      limit: 10,
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

  // Check access
  const hasAccess = isAdmin() || isKepalaSekolah();

  // Fetch teacher evaluations function
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const params: TeacherEvaluationFilterParams = {
        skip: filters.skip,
        limit: filters.limit,
      };

      // Period filtering
      if (filters.period_id === 'active' && activePeriod) {
        params.period_id = activePeriod.id;
      } else if (filters.period_id !== 'active' && filters.period_id !== 'all') {
        params.period_id = Number(filters.period_id);
      }

      // Handle search filter
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      // Organization filtering for admin only
      // Backend automatically filters by user role, but admin can choose organization
      if (isAdmin() && filters.organization_id !== 'all') {
        // Note: Backend doesn't have organization filter directly in teacher evaluations
        // We might need to filter by teachers from specific organization
        // For now, we'll let backend handle role-based filtering automatically
      }

      const response = await teacherEvaluationService.getTeacherEvaluationsFiltered(params);
      setEvaluations(response.items || []);
      setTotalItems(response.total || 0);
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
      const response = await periodService.getPeriods();
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

  // Effect to fetch evaluations when filters or active period change
  useEffect(() => {
    if (hasAccess && (filters.period_id !== 'active' || activePeriod)) {
      fetchEvaluations();
    }
  }, [filters.skip, filters.limit, filters.search, filters.period_id, filters.organization_id, activePeriod, hasAccess]);

  // Pagination
  const totalPages = Math.ceil(totalItems / filters.limit);

  const handleViewEvaluation = (evaluation: TeacherEvaluationResponse) => {
    // Navigate to evaluation detail page
    navigate(`/teacher-evaluations/${evaluation.id}`);
  };

  const handleEditEvaluation = (evaluation: TeacherEvaluationResponse) => {
    // Only allow editing if there's an active period and it matches the evaluation period
    if (!activePeriod) {
      toast({
        title: 'Periode Tidak Aktif',
        description: 'Edit evaluasi hanya dapat dilakukan pada periode aktif.',
        variant: 'destructive'
      });
      return;
    }
    
    if (evaluation.period_id !== activePeriod.id) {
      toast({
        title: 'Periode Tidak Sesuai',
        description: 'Evaluasi hanya dapat diedit pada periode yang sesuai.',
        variant: 'destructive'
      });
      return;
    }
    
    // Navigate to edit evaluation page
    navigate(`/teacher-evaluations/${evaluation.id}/edit`);
  };

  const handleAssignSuccess = () => {
    fetchEvaluations(); // Refresh the evaluations list
  };

  const handleItemsPerPageChange = (value: string) => {
    updateURL({ limit: parseInt(value), skip: 0 });
  };

  // Filter handlers
  const handleSearchChange = (search: string) => {
    updateURL({ search, skip: 0 });
  };

  const handlePeriodChange = (period_id: string) => {
    updateURL({ period_id, skip: 0 });
  };

  const handleOrganizationChange = (organization_id: string) => {
    updateURL({ organization_id, skip: 0 });
  };

  const handlePageChange = (page: number) => {
    const skip = (page - 1) * filters.limit;
    updateURL({ skip });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Evaluasi Guru";
    const activeFilters = [];
    
    // Period filter
    if (filters.period_id === 'active') {
      activeFilters.push("Periode Aktif");
    } else if (filters.period_id !== 'all') {
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
        title="Evaluasi Guru"
        description="Daftar evaluasi kinerja guru berdasarkan periode dan organisasi"
        actions={
          isAdmin() && (
            <AssignTeachersToPeriodDialog
              periods={periods}
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
              <SelectItem value="active">Periode Aktif</SelectItem>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  {period.academic_year} - {period.semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organization Filter (Admin only) */}
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
              subtitle="Daftar evaluasi kinerja guru berdasarkan periode dan organisasi"
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
                onEvaluate={handleEditEvaluation}
                userRole={currentRole as any}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <TeacherEvaluationCards
                evaluations={evaluations}
                loading={loading}
                onView={handleViewEvaluation}
                onEvaluate={handleEditEvaluation}
                userRole={currentRole as any}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={Math.floor(filters.skip / filters.limit) + 1}
                totalPages={totalPages}
                itemsPerPage={filters.limit}
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