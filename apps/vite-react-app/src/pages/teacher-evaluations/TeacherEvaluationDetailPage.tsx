import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
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
import { ArrowLeft, Eye, Edit, CheckCircle, Download } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EvaluationCategorySection } from '@/components/TeacherEvaluations';
import Filtering from '@/components/common/Filtering';
import { TeacherEvaluation } from '@/services/teacher-evaluations/types';
import { EvaluationAspect } from '@/services/evaluation-aspects/types';
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
  const navigate = useNavigate();
  const { isAdmin, isKepalaSekolah } = useRole();
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
  const [aspects, setAspects] = useState<EvaluationAspect[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
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
      loadEvaluationAspects();
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
      const response = await teacherEvaluationService.getTeacherEvaluationsInPeriod(
        Number(teacherId),
        selectedPeriod.id
      );

      // Handle both array response and object with items property
      const evaluationsData = Array.isArray(response) ? response : (response.items || []);

      setEvaluations(evaluationsData);

      // Set form values from evaluation data
      const evaluationData: Record<string, string> = {};
      evaluationsData.forEach(evaluation => {
        evaluationData[evaluation.aspect_id.toString()] = evaluation.grade;
      });

      form.reset({
        aspects: evaluationData,
        notes: evaluationsData[0]?.notes || '',
      });

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

  const loadEvaluationAspects = async () => {
    try {
      const response = await evaluationAspectService.getEvaluationAspects({
        is_active: true
      });
      setAspects(response.items || []);
    } catch (error) {
      console.error('Error loading evaluation aspects:', error);
    }
  };

  const onSubmit = async (data: EvaluationFormData) => {
    if (!teacherId || !currentPeriod) return;

    try {
      setSaving(true);

      // Prepare bulk update data
      const bulkUpdateData = {
        evaluations: evaluations.map(evaluation => ({
          evaluation_id: evaluation.id,
          grade: data.aspects[evaluation.aspect_id.toString()] as 'A' | 'B' | 'C' | 'D',
          notes: data.notes,
        })).filter(update => update.grade) // Only include evaluations with grades
      };

      await teacherEvaluationService.bulkUpdateGrades(bulkUpdateData);

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

  const handleBack = () => {
    navigate('/teacher-evaluations');
  };

  const toggleMode = () => {
    const canEdit = (isAdmin() || isKepalaSekolah()) && evaluations.length > 0;

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
        teacherName: teacherInfo.teacher_name || 'N/A',
        teacherNip: '', // Add NIP if available in data
        evaluatorName: evaluations[0]?.evaluator_name || 'N/A',
        periodAcademicYear: currentPeriod.academic_year,
        periodSemester: currentPeriod.semester,
        evaluationDate: evaluations[0]?.evaluation_date
          ? new Date(evaluations[0].evaluation_date).toLocaleDateString('id-ID')
          : new Date().toLocaleDateString('id-ID'),
        organizationName: '', // Add organization name if available
        evaluationResults: categories.map(category => ({
          category,
          aspects: aspects
            .filter(aspect => aspect.category === category)
            .map(aspect => {
              const evaluation = evaluations.find(evaluation => evaluation.aspect_id === aspect.id);
              return {
                aspectName: aspect.aspect_name,
                description: aspect.description,
                grade: evaluation?.grade || 'N/A',
                score: evaluation?.score || 0,
              };
            })
        })),
        averageScore: evaluations.length > 0
          ? evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length
          : 0,
        notes: evaluations[0]?.notes || '',
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

  const categories = [...new Set(aspects.map(aspect => aspect.category))];
  const canEdit = (isAdmin() || isKepalaSekolah());

  // Create evaluation data mapping for display
  const evaluationData: Record<string, string> = {};
  evaluations.forEach(evaluation => {
    evaluationData[evaluation.aspect_id.toString()] = evaluation.grade;
  });

  // Get teacher info from first evaluation or use teacherId
  const teacherInfo = evaluations[0] || { teacher_name: `Teacher ${teacherId}`, teacher_id: Number(teacherId) };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Evaluasi Guru"
        description={`Evaluasi kinerja ${teacherInfo.teacher_name || 'N/A'}`}
        actions={
          <div className="flex items-center gap-2">
            {/* PDF Actions - only show when evaluations exist */}
            {evaluations.length > 0 && (
              <Button variant="outline" onClick={generatePDFReport}>
                <Download className="h-4 w-4 mr-2" />
                Unduh PDF
              </Button>
            )}

            {canEdit && evaluations.length > 0 && (
              <Button variant="outline" onClick={toggleMode}>
                {mode === 'view' ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
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

      {/* No evaluations found message */}
      {!loading && evaluations.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Evaluasi Tidak Ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Tidak ada evaluasi untuk guru ini pada periode yang dipilih.
              </p>
              <p className="text-sm text-muted-foreground">
                Coba pilih periode lain atau hubungi administrator untuk informasi lebih lanjut.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Info Card */}
      {evaluations.length > 0 && (
        <Card>
        <CardHeader>
          <CardTitle>Informasi Evaluasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Guru</h4>
              <p className="text-sm">{teacherInfo.teacher_name || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Evaluator</h4>
              <p className="text-sm">{evaluations[0]?.evaluator_name || '-'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Periode</h4>
              <p className="text-sm">
                {currentPeriod ? `${currentPeriod.academic_year} - ${currentPeriod.semester}` : 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Total Aspek</h4>
              <p className="text-sm">{evaluations.length} aspek</p>
            </div>
            {evaluations.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Rata-rata Skor</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">
                    {(evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length).toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 4.0</span>
                </div>
              </div>
            )}
            {evaluations[0]?.evaluation_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Tanggal Evaluasi</h4>
                <p className="text-sm">
                  {new Date(evaluations[0].evaluation_date).toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        </Card>
      )}

      {/* Evaluation Form */}
      {evaluations.length > 0 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {categories.map((category, index) => (
            <EvaluationCategorySection
              key={category}
              category={category}
              aspects={aspects}
              control={mode === 'edit' ? form.control : undefined}
              sectionNumber={index + 1}
              disabled={mode === 'view'}
              evaluationData={evaluationData}
            />
          ))}

          {/* Notes Section */}
          {(evaluations[0]?.notes || mode === 'edit') && (
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
                    {evaluations[0]?.notes || 'Tidak ada catatan'}
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