import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Form } from '@workspace/ui/components/form';
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
import { Eye, Edit, CheckCircle, Download } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EvaluationCategorySection } from '@/components/TeacherEvaluations';
import Filtering from '@/components/common/Filtering';
import { TeacherEvaluation } from '@/services/teacher-evaluations/types';
import { CategoryWithAspectsResponse } from '@/services/evaluation-aspects/types';
import { Period } from '@/services/periods/types';
import { teacherEvaluationService, evaluationAspectService, periodService } from '@/services';
import { generateEvaluationPDF, EvaluationReportData } from '@/utils/pdfReportUtils';

const evaluationFormSchema = z.object({
  aspects: z.record(z.string(), z.string().min(1, 'Rating harus dipilih')),
  notes: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationFormSchema>;

interface DetailPageFilters {
  period_id: string;
  [key: string]: string | number;
}

const TeacherEvaluationDetailPage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { isAdmin, isKepalaSekolah } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<DetailPageFilters>({
    defaults: {
      period_id: 'latest',
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();

  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
  const [categoriesWithAspects, setCategoriesWithAspects] = useState<CategoryWithAspectsResponse[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: {
      aspects: {},
      notes: '',
    },
  });

  useEffect(() => {
    if (teacherId) {
      loadPeriods();
      loadCategoriesWithAspects();
      loadActivePeriod();
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId && periods.length > 0) {
      loadEvaluationDetail();
    }
  }, [teacherId, filters.period_id, periods]);

  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods();
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  const loadEvaluationDetail = async () => {
    try {
      setLoading(true);

      if (periods.length === 0) {
        throw new Error('No periods available');
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

      // Get teacher evaluations for the selected period
      const response = await teacherEvaluationService.getEvaluationsByPeriod(
        selectedPeriod.id
      );

      // Check if response has items property (paginated response)
      let evaluationsArray;
      if (response && typeof response === 'object' && 'items' in response) {
        evaluationsArray = response.items;
      } else if (Array.isArray(response)) {
        evaluationsArray = response;
      } else {
        evaluationsArray = [];
      }

      // Filter for the specific teacher
      const teacherEvaluations = Array.isArray(evaluationsArray)
        ? evaluationsArray.filter(evaluation => evaluation.teacher_id === Number(teacherId))
        : [];

      // Store final evaluations result for form initialization
      let finalEvaluations = teacherEvaluations;

      // If no evaluations found, try alternative approach
      if (teacherEvaluations.length === 0) {
        try {
          const alternativeResponse = await teacherEvaluationService.getEvaluationsByTeacher(
            Number(teacherId),
            { period_id: selectedPeriod.id }
          );

          if (alternativeResponse && alternativeResponse.items && alternativeResponse.items.length > 0) {
            finalEvaluations = alternativeResponse.items;
            setEvaluations(alternativeResponse.items);
          } else {
            setEvaluations(teacherEvaluations);
          }
        } catch (altError) {
          console.error('Alternative approach failed:', altError);
          setEvaluations(teacherEvaluations);
        }
      } else {
        setEvaluations(teacherEvaluations);
      }

      // Set form values from evaluation items
      // Create a map of aspect_id -> grade from all evaluation items
      const evaluationData: Record<string, string> = {};
      finalEvaluations.forEach(evaluation => {
        evaluation.items?.forEach((item: { aspect_id: { toString: () => string | number; }; grade: string; }) => {
          evaluationData[item.aspect_id.toString()] = item.grade;
        });
      });

      form.reset({
        aspects: evaluationData,
        notes: finalEvaluations[0]?.final_notes || '',
      });

      setEvaluations(finalEvaluations);

      // Always start in view mode
      setMode('view');
    } catch (error) {
      console.error('Error loading evaluation detail:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat detail evaluasi. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesWithAspects = async () => {
    try {
      // First, get all categories
      const categoriesResponse = await evaluationAspectService.getCategories();
      const categories = categoriesResponse || [];

      // Then, for each category, get its aspects
      const categoriesWithAspectsPromises = categories
        .filter(category => category.is_active) // Only active categories
        .map(async (category) => {
          try {
            const categoryWithAspects = await evaluationAspectService.getCategoryWithAspects(category.id);
            // Filter only active aspects
            return {
              ...categoryWithAspects,
              aspects: categoryWithAspects.aspects.filter(aspect => aspect.is_active)
            };
          } catch (error) {
            console.error(`Error loading aspects for category ${category.id}:`, error);
            return null;
          }
        });

      const results = await Promise.all(categoriesWithAspectsPromises);
      const validCategories = results
        .filter(category => category !== null && category.aspects.length > 0) // Only categories with aspects
        .sort((a, b) => a!.display_order - b!.display_order); // Sort by display_order

      setCategoriesWithAspects(validCategories as CategoryWithAspectsResponse[]);
    } catch (error) {
      console.error('Error loading categories with aspects:', error);
    }
  };

  const loadActivePeriod = async () => {
    try {
      const activeResponse = await periodService.getActivePeriod();
      setActivePeriod(activeResponse);
    } catch (error) {
      console.error('Error loading active period:', error);
    }
  };

  const onSubmit = async (data: EvaluationFormData) => {
    if (!teacherId || !currentPeriod) return;

    try {
      setSaving(true);

      // Prepare bulk update data for evaluation items
      const bulkUpdateData: {
        item_updates: Array<{
          aspect_id: number;
          grade: 'A' | 'B' | 'C' | 'D';
          notes: string | undefined;
        }>
      } = {
        item_updates: []
      };

      // Collect all aspect IDs that have grades
      Object.entries(data.aspects).forEach(([aspectId, grade]) => {
        if (grade) {
          bulkUpdateData.item_updates.push({
            aspect_id: Number(aspectId),
            grade: grade as 'A' | 'B' | 'C' | 'D',
            notes: data.notes
          });
        }
      });

      // Update evaluation items if we have an evaluation, otherwise create new evaluation
      if (evaluations.length > 0) {
        await teacherEvaluationService.bulkUpdateEvaluationItems(
          evaluations[0].id,
          bulkUpdateData
        );
      } else {
        // Create new evaluation with items
        // Convert item_updates format to items format
        const items = bulkUpdateData.item_updates.map(update => ({
          aspect_id: update.aspect_id,
          grade: update.grade,
          notes: update.notes
        }));

        const createData = {
          teacher_id: Number(teacherId),
          evaluator_id: user?.id || 1, // Get current user ID from auth context
          period_id: currentPeriod.id,
          final_notes: data.notes,
          items: items
        };

        await teacherEvaluationService.createEvaluationWithItems(createData);
      }

      toast({
        title: 'Berhasil',
        description: 'Evaluasi berhasil disimpan.',
      });

      // Refresh evaluation data and switch back to view mode
      await loadEvaluationDetail();
    } catch (error: any) {
      console.error('Error saving evaluation:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal menyimpan evaluasi. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };


  const toggleMode = () => {
    const isActivePeriod = activePeriod && currentPeriod && activePeriod.id === currentPeriod.id;
    const canEdit = (isAdmin() || isKepalaSekolah()) && categoriesWithAspects.length > 0 && isActivePeriod;

    if (canEdit) {
      setMode(mode === 'view' ? 'edit' : 'view');
    }
  };

  const generatePDFReport = () => {
    if (!evaluations.length || !currentPeriod) {
      toast({
        title: 'Error',
        description: 'Data evaluasi tidak lengkap untuk generate PDF.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Prepare data for PDF
      const reportData: EvaluationReportData = {
        teacherName: teacherInfo.teacher?.display_name || 'N/A',
        teacherNip: '', // Add NIP if available in data
        evaluatorName: evaluations[0]?.evaluator?.full_name || evaluations[0]?.evaluator?.display_name || 'N/A',
        periodAcademicYear: currentPeriod.academic_year,
        periodSemester: currentPeriod.semester,
        evaluationDate: evaluations[0]?.last_updated
          ? new Date(evaluations[0].last_updated).toLocaleDateString('id-ID')
          : new Date().toLocaleDateString('id-ID'),
        organizationName: '', // Add organization name if available
        evaluationResults: sortedCategories.map(categoryData => ({
          category: categoryData.name,
          aspects: categoryData.aspects.map(aspect => {
            // Find evaluation item for this aspect
            const evaluationItem = evaluations
              .flatMap(evaluation => evaluation.items || [])
              .find(item => item.aspect_id === aspect.id);
            return {
              aspectName: aspect.aspect_name,
              description: aspect.description,
              grade: evaluationItem?.grade || 'N/A',
              score: evaluationItem?.score || 0,
            };
          })
        })),
        averageScore: evaluations.length > 0 ? evaluations[0].average_score : 0,
        notes: evaluations[0]?.final_notes || '',
      };

      generateEvaluationPDF(reportData);

      toast({
        title: 'Berhasil',
        description: 'PDF laporan evaluasi berhasil diunduh.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Gagal generate PDF. Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  const handlePeriodFilterChange = (period_id: string) => {
    updateURL({ period_id });
  };

  // Categories with aspects are already sorted from the API
  const sortedCategories = categoriesWithAspects;

  const isActivePeriod = activePeriod && currentPeriod && activePeriod.id === currentPeriod.id;
  const canEdit = (isAdmin() || isKepalaSekolah()) && isActivePeriod;

  // Create evaluation data mapping for display
  const evaluationData: Record<string, string> = {};
  evaluations.forEach(evaluation => {
    evaluation.items?.forEach(item => {
      evaluationData[item.aspect_id.toString()] = item.grade;
    });
  });

  // Get teacher info from first evaluation or use teacherId
  const teacherInfo = evaluations[0] || { teacher_name: `Teacher ${teacherId}`, teacher_id: Number(teacherId) };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Evaluasi Guru"
        description={`Evaluasi kinerja ${teacherInfo.teacher?.display_name || 'N/A'}`}
        actions={
          <div className="flex items-center gap-2">
            {/* PDF Actions - only show when evaluations exist */}
            {evaluations.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">
                    <Download className="h-4 w-4 mr-2" />
                    Unduh PDF
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Unduh PDF</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin mengunduh laporan evaluasi untuk <strong>{teacherInfo.teacher?.display_name || 'N/A'}</strong> periode {currentPeriod?.academic_year} - {currentPeriod?.semester} dalam format PDF?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={generatePDFReport}>
                      Ya, Unduh PDF
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {canEdit && categoriesWithAspects.length > 0 && (
              <Button variant="outline" onClick={toggleMode}>
                {mode === 'view' ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Ubah Nilai
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat
                  </>
                )}
              </Button>
            )}
          </div>
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

      {/* No evaluation aspects found message */}
      {!loading && categoriesWithAspects.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Aspek Evaluasi Tidak Ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Tidak ada aspek evaluasi yang aktif dalam sistem.
              </p>
              <p className="text-sm text-muted-foreground">
                Hubungi administrator untuk mengatur aspek evaluasi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Info Card - Show basic info even without evaluations */}
      {categoriesWithAspects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Evaluasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Guru</h4>
                <p className="text-sm">
                  {evaluations.length > 0
                    ? (teacherInfo.teacher?.display_name || `Teacher ${teacherId}`)
                    : `Teacher ${teacherId}`
                  }
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Evaluator</h4>
                <p className="text-sm">{evaluations[0]?.evaluator?.full_name || '-'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Periode</h4>
                <p className="text-sm">
                  {currentPeriod ? `${currentPeriod.academic_year} - ${currentPeriod.semester}` : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Total Aspek</h4>
                <p className="text-sm">{categoriesWithAspects.reduce((total, cat) => total + cat.aspects.length, 0)} aspek</p>
              </div>
              {evaluations.length > 0 && (
                <>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Aspek Dinilai</h4>
                    <p className="text-sm">{evaluations.reduce((total, evaluation) => total + (evaluation.items?.length || 0), 0)} aspek</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Rata-rata Skor</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">
                        {evaluations[0].average_score.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">/ 4.0</span>
                    </div>
                  </div>
                  {evaluations[0]?.last_updated && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Tanggal Evaluasi</h4>
                      <p className="text-sm">
                        {new Date(evaluations[0].last_updated).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Form - Show form based on aspects, not evaluations */}
      {categoriesWithAspects.length > 0 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {sortedCategories.map((categoryData, index) => (
              <EvaluationCategorySection
                key={categoryData.name}
                category={categoryData.name}
                aspects={categoryData.aspects}
                control={mode === 'edit' ? form.control : undefined}
                sectionNumber={index + 1}
                disabled={mode === 'view'}
                evaluationData={evaluationData}
              />
            ))}

            {/* Notes Section */}
            {(evaluations[0]?.final_notes || mode === 'edit') && (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan Evaluasi</CardTitle>
                </CardHeader>
                <CardContent>
                  {mode === 'edit' ? (
                    <textarea
                      {...form.register('notes')}
                      placeholder="Tambahkan catatan untuk evaluasi ini..."
                      className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {evaluations[0]?.final_notes || 'Tidak ada catatan'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            {mode === 'edit' && (
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Simpan Nilai Evaluasi
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      )}
    </div>
  );
};

export default TeacherEvaluationDetailPage;