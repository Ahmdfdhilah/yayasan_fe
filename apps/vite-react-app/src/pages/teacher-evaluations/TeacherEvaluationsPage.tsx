import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { UserRole } from '@/lib/constants';
import { 
  TeacherEvaluation, 
  TeacherEvaluationFilterParams,
  TeacherEvaluationStatus 
} from '@/services/teacher-evaluations/types';
import { Period } from '@/services/periods/types';
import { teacherEvaluationService, periodService } from '@/services';
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
import { TeacherEvaluationTable } from '@/components/TeacherEvaluations/TeacherEvaluationTable';
import { TeacherEvaluationCards } from '@/components/TeacherEvaluations/TeacherEvaluationCards';
import AssignTeachersDialog from '@/components/TeacherEvaluations/AssignTeachersDialog';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';

interface TeacherEvaluationPageFilters {
  q: string;
  period_id: string;
  status: string;
  grade: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const TeacherEvaluationsPage: React.FC = () => {
  const { currentRole, isAdmin, isKepalaSekolah } = useRole();
  const { toast } = useToast();
  
  // Redirect guru to my-evaluations
  if (currentRole === 'guru') {
    return <Navigate to="/my-evaluations" replace />;
  }

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<TeacherEvaluationPageFilters>({
    defaults: {
      q: '',
      period_id: 'all',
      status: 'all',
      grade: 'all',
      page: 1,
      size: 10,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();
  
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Check access
  const hasAccess = isAdmin() || isKepalaSekolah();

  useEffect(() => {
    if (hasAccess) {
      loadPeriods();
      loadEvaluations();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess) {
      loadEvaluations();
    }
  }, [filters, hasAccess]);

  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods({ is_active: true });
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      
      const params: TeacherEvaluationFilterParams = {
        page: filters.page,
        size: filters.size,
      };

      // Add search query
      if (filters.q) {
        params.search = filters.q;
      }

      // Add period filter
      if (filters.period_id !== 'all') {
        params.period_id = Number(filters.period_id);
      }

      // Add status filter
      if (filters.status !== 'all') {
        params.status = filters.status as TeacherEvaluationStatus;
      }

      // Add grade filter
      if (filters.grade !== 'all') {
        params.grade = filters.grade as 'A' | 'B' | 'C' | 'D';
      }

      const response = await teacherEvaluationService.getTeacherEvaluations(params);
      
      setEvaluations(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error: any) {
      console.error('Error loading teacher evaluations:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data evaluasi guru. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (search: string) => {
    updateURL({ q: search, page: 1 });
  };

  const handlePeriodFilterChange = (period_id: string) => {
    updateURL({ period_id, page: 1 });
  };

  const handleStatusFilterChange = (status: string) => {
    updateURL({ status, page: 1 });
  };

  const handleGradeFilterChange = (grade: string) => {
    updateURL({ grade, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const handleItemsPerPageChange = (value: string) => {
    const size = parseInt(value, 10);
    updateURL({ size, page: 1 });
  };

  const handleView = (evaluation: TeacherEvaluation) => {
    // Navigate to detail page
    window.location.href = `/teacher-evaluations/${evaluation.id}`;
  };

  const handleEvaluate = (evaluation: TeacherEvaluation) => {
    // Navigate to evaluation page
    window.location.href = `/teacher-evaluations/${evaluation.id}`;
  };

  const handleAssignTeachers = () => {
    setIsAssignDialogOpen(true);
  };

  const handleAssignSuccess = () => {
    loadEvaluations(); // Refresh the evaluations list
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Evaluasi Guru";
    const activeFilters = [];
    
    if (filters.status !== 'all') {
      const statusLabels = {
        pending: 'Menunggu',
        in_progress: 'Berlangsung', 
        completed: 'Selesai',
        draft: 'Draft'
      };
      activeFilters.push(statusLabels[filters.status as keyof typeof statusLabels]);
    }
    
    if (filters.grade !== 'all') {
      activeFilters.push(`Grade ${filters.grade}`);
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
        description="Kelola evaluasi kinerja guru dan lihat hasil penilaian"
        actions={
          isAdmin() && (
            <Button onClick={handleAssignTeachers}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Teachers to Period
            </Button>
          )
        }
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
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="in_progress">Berlangsung</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade-filter">Grade</Label>
          <Select value={filters.grade} onValueChange={handleGradeFilterChange}>
            <SelectTrigger id="grade-filter">
              <SelectValue placeholder="Filter berdasarkan grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Grade</SelectItem>
              <SelectItem value="A">A - Sangat Baik</SelectItem>
              <SelectItem value="B">B - Baik</SelectItem>
              <SelectItem value="C">C - Cukup</SelectItem>
              <SelectItem value="D">D - Perlu Perbaikan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Kelola evaluasi kinerja guru dan lihat hasil penilaian"
            />

            <SearchContainer
              searchQuery={filters.q}
              onSearchChange={handleSearchChange}
              placeholder="Cari berdasarkan nama guru atau evaluator..."
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <TeacherEvaluationTable
                evaluations={evaluations}
                loading={loading}
                onView={handleView}
                onEvaluate={handleEvaluate}
                userRole={currentRole as UserRole}
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <TeacherEvaluationCards
                evaluations={evaluations}
                loading={loading}
                onView={handleView}
                onEvaluate={handleEvaluate}
                userRole={currentRole as UserRole}
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

      {/* Assign Teachers Dialog */}
      <AssignTeachersDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default TeacherEvaluationsPage;