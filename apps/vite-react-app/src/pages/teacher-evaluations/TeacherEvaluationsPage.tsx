import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { UserRole } from '@/services/auth/types';
import { User, UserFilterParams } from '@/services/users/types';
import { Organization } from '@/services/organizations/types';
import { userService, organizationService, periodService } from '@/services';
import { Period } from '@/services/periods/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { Plus } from 'lucide-react';
import { UserTable } from '@/components/Users/UserTable';
import { UserCards } from '@/components/Users/UserCards';
import { AssignTeachersToPeriodDialog } from '@/components/TeacherEvaluations';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';

interface TeacherPageFilters {
  search: string;
  organization_id: string;
  page: number;
  size: number;
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

  // Get current user info for organization filtering
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<TeacherPageFilters>({
    defaults: {
      search: '',
      organization_id: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [teachers, setTeachers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [activePeriod, setActivePeriod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Check access
  const hasAccess = isAdmin() || isKepalaSekolah();

  // Fetch teachers function
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params: UserFilterParams = {
        page: filters.page,
        size: filters.size,
        role: UserRole.GURU, 
        search: filters.search || undefined,
      };

      // No period filtering needed for this page

      // Auto-filter by organization for kepala sekolah, or allow admin to choose
      if (isKepalaSekolah() && currentUser?.organization_id) {
        params.organization_id = currentUser.organization_id;
      } else if (isAdmin() && filters.organization_id !== 'all') {
        params.organization_id = Number(filters.organization_id);
      }

      const response = await userService.getUsers(params);
      setTeachers(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error: any) {
      console.error('Error loading teachers:', error);
      const errorMessage = error?.message || 'Gagal memuat data guru. Silakan coba lagi.';
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
      fetchTeachers();
    }
  }, [filters.page, filters.size, filters.search, filters.organization_id, hasAccess]);

  // Pagination
  const totalPages = Math.ceil(totalItems / filters.size);

  const handleViewTeacherEvaluations = (teacher: User) => {
    // Navigate to teacher's evaluations detail page
    navigate(`/teacher-evaluations/${teacher.id}`);
  };

  const handleCreateEvaluation = (teacher: User) => {
    // Only allow editing if there's an active period
    if (!activePeriod) {
      toast({
        title: 'Periode Tidak Aktif',
        description: 'Edit evaluasi hanya dapat dilakukan pada periode aktif.',
        variant: 'destructive'
      });
      return;
    }
    // Navigate to create evaluation page (same as view for now, will be edit mode)
    navigate(`/teacher-evaluations/${teacher.id}`);
  };

  const handleAssignSuccess = () => {
    fetchTeachers(); // Refresh the teachers list
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

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Daftar Guru";
    const activeFilters = [];
    
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
        title="Daftar Guru"
        description="Kelola evaluasi kinerja guru - pilih guru untuk membuat evaluasi atau melihat riwayat evaluasi"
        actions={
          isAdmin() && (
            <AssignTeachersToPeriodDialog
              periods={periods}
              onSuccess={handleAssignSuccess}
            />
          )
        }
      />

      {/* Only show filtering if admin (for organization filter) */}
      {isAdmin() && (
        <Filtering>
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
        </Filtering>
      )}

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola evaluasi kinerja guru - pilih guru untuk membuat evaluasi atau melihat riwayat evaluasi"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari berdasarkan nama guru atau email..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <UserTable
                users={teachers}
                loading={loading}
                onView={handleViewTeacherEvaluations}
                onEdit={handleCreateEvaluation}
                onDelete={() => {}}
                disableEdit={!activePeriod}
                editDisabledTooltip="Edit evaluasi hanya dapat dilakukan pada periode aktif"
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <UserCards
                users={teachers}
                loading={loading}
                onView={handleViewTeacherEvaluations}
                onEdit={handleCreateEvaluation}
                onDelete={() => {}}
                disableEdit={!activePeriod}
                editDisabledTooltip="Edit evaluasi hanya dapat dilakukan pada periode aktif"
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