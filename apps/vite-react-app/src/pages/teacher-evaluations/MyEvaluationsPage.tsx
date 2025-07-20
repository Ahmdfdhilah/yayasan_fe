import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { 
  TeacherEvaluation, 
  TeacherEvaluationFilterParams
} from '@/services/teacher-evaluations/types';
import { Period } from '@/services/periods/types';
import { teacherEvaluationService, periodService } from '@/services';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { TeacherEvaluationTable } from '@/components/TeacherEvaluations/TeacherEvaluationTable';
import { TeacherEvaluationCards } from '@/components/TeacherEvaluations/TeacherEvaluationCards';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';

interface MyEvaluationPageFilters {
  period_id: string;
  status: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const MyEvaluationsPage: React.FC = () => {
  const { isGuru } = useRole();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<MyEvaluationPageFilters>({
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
  
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Check access
  const hasAccess = isGuru();

  useEffect(() => {
    if (hasAccess) {
      loadPeriods();
      loadMyEvaluations();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess) {
      loadMyEvaluations();
    }
  }, [filters, hasAccess]);

  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods();
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  const loadMyEvaluations = async () => {
    try {
      setLoading(true);
      
      const params: TeacherEvaluationFilterParams = {
        page: filters.page,
        size: filters.size,
      };

      // Add period filter
      if (filters.period_id !== 'all') {
        params.period_id = Number(filters.period_id);
      }

      // Add status filter - Note: Status filtering may not be available in new API
      // if (filters.status !== 'all') {
      //   params.status = filters.status;
      // }

      // Note: Using getAllEvaluations for now, may need specific endpoint for current user
      const response = await teacherEvaluationService.getAllEvaluations(params);
      
      setEvaluations(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error: any) {
      console.error('Error loading my evaluations:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data evaluasi. Silakan coba lagi.',
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

  const handleView = (evaluation: TeacherEvaluation) => {
    // Navigate to detail page
    window.location.href = `/teacher-evaluations/${evaluation.id}`;
  };

  // Generate composite title
  const getCompositeTitle = () => {
    let title = "Evaluasi Saya";
    const activeFilters = [];
    
    // Status filter removed for now as it may not be available in new API
    // if (filters.status !== 'all') {
    //   const statusLabels = {
    //     pending: 'Menunggu',
    //     in_progress: 'Berlangsung', 
    //     completed: 'Selesai',
    //     draft: 'Draft'
    //   };
    //   activeFilters.push(statusLabels[filters.status as keyof typeof statusLabels]);
    // }

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluasi Saya"
        description="Lihat hasil evaluasi kinerja Anda dari periode ke periode"
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

        {/* Status filter temporarily removed - may not be available in new API */}
        {/* <div className="space-y-2">
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
        </div> */}
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={getCompositeTitle()}
              subtitle="Lihat hasil evaluasi kinerja Anda dari periode ke periode"
            />

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <TeacherEvaluationTable
                evaluations={evaluations}
                loading={loading}
                onView={handleView}
                userRole="guru"
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <TeacherEvaluationCards
                evaluations={evaluations}
                loading={loading}
                onView={handleView}
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

export default MyEvaluationsPage;