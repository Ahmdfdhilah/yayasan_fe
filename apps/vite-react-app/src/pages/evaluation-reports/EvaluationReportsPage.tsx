import React, { useState, useEffect } from 'react';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { BarChart3, Download, Users, FileText, TrendingUp, Clock } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import Filtering from '@/components/common/Filtering';
import { Period } from '@/services/periods/types';
import { PeriodEvaluationStats } from '@/services/teacher-evaluations/types';
import { teacherEvaluationService, periodService } from '@/services';
import { exportEvaluationReportToExcel } from '@/utils/excelExportUtils';

interface ReportPageFilters {
  period_id: string;
  [key: string]: string | number;
}

const EvaluationReportsPage: React.FC = () => {
  const { toast } = useToast();

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<ReportPageFilters>({
    defaults: {
      period_id: 'latest',
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [stats, setStats] = useState<PeriodEvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    loadPeriods();
  }, []);

  useEffect(() => {
    if (periods.length > 0) {
      loadStats();
    }
  }, [filters.period_id, periods]);

  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods();
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data periode. Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);

      if (periods.length === 0) {
        return;
      }

      // Determine which period to use
      let selectedPeriod: Period;

      if (filters.period_id === 'latest') {
        // Sort periods to get the latest
        const sortedPeriods = [...periods].sort((a, b) => {
          if (a.academic_year !== b.academic_year) {
            return b.academic_year.localeCompare(a.academic_year);
          }
          return a.semester === 'Ganjil' ? 1 : -1;
        });
        selectedPeriod = sortedPeriods[0];
      } else {
        const foundPeriod = periods.find(p => p.id === Number(filters.period_id));
        if (!foundPeriod) {
          throw new Error('Selected period not found');
        }
        selectedPeriod = foundPeriod;
      }

      setCurrentPeriod(selectedPeriod);

      // Get evaluation statistics for the selected period
      const statsResponse = await teacherEvaluationService.getPeriodEvaluationStats(selectedPeriod.id);
      setStats(statsResponse);

    } catch (error) {
      console.error('Error loading evaluation stats:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat statistik evaluasi. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodFilterChange = (period_id: string) => {
    updateURL({ period_id });
  };

  const handleExportExcel = async () => {
    if (!stats || !currentPeriod) {
      toast({
        title: 'Error',
        description: 'Data statistik tidak tersedia untuk export.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setExportingExcel(true);
      await exportEvaluationReportToExcel(stats, currentPeriod, toast);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: 'Error',
        description: 'Gagal export laporan ke Excel. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setExportingExcel(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!stats) return 0;
    return Math.round(stats.completion_percentage);
  };

  const getAverageScore = () => {
    if (!stats || stats.completed_evaluations === 0) return 0;
    return stats.average_score.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Evaluasi"
        description="Statistik dan laporan evaluasi kinerja guru berdasarkan periode"
        actions={
          stats && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={exportingExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  {exportingExcel ? 'Mengunduh...' : 'Unduh Excel'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Unduh Excel</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin mengunduh laporan evaluasi periode {currentPeriod?.academic_year} - {currentPeriod?.semester} dalam format Excel?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleExportExcel}>
                    Ya, Unduh Excel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="period-filter">Periode</Label>
          <Select value={filters.period_id} onValueChange={handlePeriodFilterChange}>
            <SelectTrigger id="period-filter">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Periode Terbaru</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  {period.academic_year} - {period.semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      {stats && currentPeriod && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_teachers}</div>
                <p className="text-xs text-muted-foreground">
                  Guru yang terdaftar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Evaluasi Selesai</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_evaluations}</div>
                <p className="text-xs text-muted-foreground">
                  dari {stats.total_evaluations} total evaluasi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Persentase Selesai</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
                <p className="text-xs text-muted-foreground">
                  Tingkat penyelesaian
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Skor</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageScore()}</div>
                <p className="text-xs text-muted-foreground">
                  dari skala 4.0
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Period Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informasi Periode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Periode</h4>
                  <p className="text-sm">{currentPeriod.academic_year} - {currentPeriod.semester}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Tanggal Dibuat</h4>
                  <p className="text-sm">
                    {new Date(currentPeriod.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          {stats.final_grade_distribution && (
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.final_grade_distribution.A || 0}</div>
                    <div className="text-sm text-muted-foreground">Nilai A (Sangat Baik)</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.final_grade_distribution.B || 0}</div>
                    <div className="text-sm text-muted-foreground">Nilai B (Baik)</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.final_grade_distribution.C || 0}</div>
                    <div className="text-sm text-muted-foreground">Nilai C (Cukup)</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.final_grade_distribution.D || 0}</div>
                    <div className="text-sm text-muted-foreground">Nilai D (Perlu Perbaikan)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Performers */}
          {stats.top_performers && stats.top_performers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Guru Terbaik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.top_performers.slice(0, 10).map((teacher, index) => (
                    <div key={teacher.teacher_id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold text-primary">#{index + 1}</div>
                        <div>
                          <h4 className="font-medium">{teacher.teacher_name}</h4>
                          <p className="text-sm text-muted-foreground">{teacher.organization_name}</p>
                          <div className="text-sm text-muted-foreground">
                            Nilai Akhir: {teacher.final_grade.toFixed(2)} ({teacher.final_grade_letter}) | Rata-rata: {teacher.average_score.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aspect Performance */}
          {stats.aspect_performance && stats.aspect_performance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performa per Aspek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.aspect_performance.map((aspect, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{aspect.aspect_name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rata-rata Skor:</span>
                          <span className="ml-2 font-medium">{aspect.average_score.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Jumlah Evaluasi:</span>
                          <span className="ml-2 font-medium">{aspect.total_evaluations}</span>
                        </div>
                        <div className="md:col-span-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(aspect.average_score / 4) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!stats && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Data</h3>
              <p className="text-muted-foreground">
                Belum ada statistik evaluasi untuk periode yang dipilih.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EvaluationReportsPage;