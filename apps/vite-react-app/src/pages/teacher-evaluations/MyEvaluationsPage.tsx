import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { 
  TeacherEvaluation, 
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
  const navigate = useNavigate();
  const { isGuru } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<MyEvaluationPageFilters>({
    defaults: {
      period_id: 'latest',
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
    if (hasAccess && user?.id) {
      loadMyEvaluations();
    }
  }, [filters, hasAccess, user?.id, periods]);

  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods();
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  const loadMyEvaluations = async () => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }

    try {
      setLoading(true);
      
      // Determine which period to use
      let periodId: number | undefined;
      
      if (filters.period_id === 'latest') {
        // Use latest period if available
        if (periods.length > 0) {
          // Sort periods by academic year and semester to get the latest
          const sortedPeriods = [...periods].sort((a, b) => {
            if (a.academic_year !== b.academic_year) {
              return b.academic_year.localeCompare(a.academic_year);
            }
            // Assume 'Ganjil' comes before 'Genap' in a year
            if (a.semester === b.semester) return 0;
            return a.semester === 'Ganjil' ? 1 : -1;
          });
          periodId = sortedPeriods[0].id;
        } else {
          setEvaluations([]);
          setTotalItems(0);
          return;
        }
      } else if (filters.period_id !== 'all') {
        periodId = Number(filters.period_id);
      } else {
        // Show all evaluations across all periods
        // For now, we'll use the latest period as the API might not support all periods
        if (periods.length > 0) {
          const sortedPeriods = [...periods].sort((a, b) => {
            if (a.academic_year !== b.academic_year) {
              return b.academic_year.localeCompare(a.academic_year);
            }
            return a.semester === 'Ganjil' ? 1 : -1;
          });
          periodId = sortedPeriods[0].id;
        } else {
          setEvaluations([]);
          setTotalItems(0);
          return;
        }
      }
      
      const params = {
        page: filters.page,
        size: filters.size,
      };

      // Use getTeacherEvaluationsInPeriod with current user's ID
      const response = await teacherEvaluationService.getTeacherEvaluationsInPeriod(
        user.id,
        periodId!,
        params
      );
      
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

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const handleItemsPerPageChange = (value: string) => {
    const size = parseInt(value, 10);
    updateURL({ size, page: 1 });
  };

  const handleView = () => {
    // Navigate to detail page using current user's ID (always my evaluations)
    navigate(`/teacher-evaluations/${user?.id}`);
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

    if (filters.period_id === 'latest') {
      activeFilters.push("Periode Terbaru");
    } else if (filters.period_id !== 'all') {
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
              <SelectItem value="latest">Periode Terbaru</SelectItem>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  {period.academic_year} - {period.semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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