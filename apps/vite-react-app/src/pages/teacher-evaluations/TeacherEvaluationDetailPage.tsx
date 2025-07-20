import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRole } from '@/hooks/useRole';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Form } from '@workspace/ui/components/form';
import { ArrowLeft, Eye, Edit, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EvaluationCategorySection } from '@/components/TeacherEvaluations/EvaluationCategorySection';
import { TeacherEvaluation } from '@/services/teacher-evaluations/types';
import { EvaluationAspect } from '@/services/evaluation-aspects/types';
import { teacherEvaluationService, evaluationAspectService } from '@/services';

const evaluationFormSchema = z.object({
  aspects: z.record(z.string(), z.string().min(1, 'Rating harus dipilih')),
  notes: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationFormSchema>;

const TeacherEvaluationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isKepalaSekolah } = useRole();
  const { toast } = useToast();

  const [evaluation, setEvaluation] = useState<TeacherEvaluation | null>(null);
  const [aspects, setAspects] = useState<EvaluationAspect[]>([]);
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
    if (id) {
      loadEvaluationDetail();
      loadEvaluationAspects();
    }
  }, [id]);

  const loadEvaluationDetail = async () => {
    try {
      setLoading(true);
      const response = await teacherEvaluationService.getTeacherEvaluation(Number(id));
      setEvaluation(response);
      
      // Set form values from evaluation data
      const evaluationData: Record<string, string> = {};
      // Initialize with existing evaluation data if available
      form.reset({
        aspects: evaluationData,
        notes: response.notes || '',
      });
      
      // Determine initial mode based on user role (status may not be available)
      const canEdit = (isAdmin() || isKepalaSekolah());
      setMode(canEdit ? 'edit' : 'view');
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
        size: 1000,
        is_active: true 
      });
      setAspects(response.items || []);
    } catch (error) {
      console.error('Error loading evaluation aspects:', error);
    }
  };

  const onSubmit = async (data: EvaluationFormData) => {
    if (!evaluation) return;

    try {
      setSaving(true);
      
      // Update evaluation with new grade and notes
      await teacherEvaluationService.updateTeacherEvaluation(evaluation.id, {
        grade: Object.values(data.aspects)[0] as 'A' | 'B' | 'C' | 'D', // Use first aspect grade for now
        notes: data.notes,
      });

      toast({
        title: 'Berhasil',
        description: 'Evaluasi berhasil disimpan.',
      });

      // Refresh evaluation data
      await loadEvaluationDetail();
      setMode('view');
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
    navigate(-1);
  };

  const toggleMode = () => {
    const canEdit = (isAdmin() || isKepalaSekolah()) && evaluation;
    
    if (canEdit) {
      setMode(mode === 'view' ? 'edit' : 'view');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Evaluasi Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-4">
            Evaluasi yang Anda cari tidak dapat ditemukan.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(aspects.map(aspect => aspect.category))];
  const canEdit = (isAdmin() || isKepalaSekolah());

  const getGradeBadge = (grade: string) => {
    const gradeConfig = {
      A: { label: 'A - Excellent', variant: 'default' as const },
      B: { label: 'B - Good', variant: 'secondary' as const },
      C: { label: 'C - Satisfactory', variant: 'outline' as const },
      D: { label: 'D - Needs Improvement', variant: 'destructive' as const },
    };
    
    const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig.A;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Evaluasi Guru"
        description={`Evaluasi kinerja ${evaluation.teacher_name || 'N/A'}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            {canEdit && (
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

      {/* Evaluation Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Evaluasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Guru</h4>
              <p className="text-sm">{evaluation.teacher_name || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Evaluator</h4>
              <p className="text-sm">{evaluation.evaluator_name || '-'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Periode</h4>
              <p className="text-sm">{evaluation.period_name || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Aspek</h4>
              <p className="text-sm">{evaluation.aspect_name || 'N/A'}</p>
            </div>
            {evaluation.grade && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Grade</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {evaluation.grade}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({evaluation.score || 0} poin)
                  </span>
                </div>
              </div>
            )}
            {evaluation.evaluation_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Tanggal Evaluasi</h4>
                <p className="text-sm">
                  {new Date(evaluation.evaluation_date).toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Form */}
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
              evaluationData={{}}
            />
          ))}

          {/* Notes Section */}
          {(evaluation.notes || mode === 'edit') && (
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
                    {evaluation.notes || 'Tidak ada catatan'}
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
                    Selesaikan Evaluasi
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default TeacherEvaluationDetailPage;