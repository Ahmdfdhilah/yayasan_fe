import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Eye,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Send
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import Filtering from '@/components/common/Filtering';
import {
  RPPSubmissionResponse,
  RPPSubmissionItemResponse,
  RPPSubmissionStatus,
} from '@/services/rpp-submissions/types';
import { Period } from '@/services/periods/types';
import { User } from '@/services/users/types';
import {
  rppSubmissionService,
  periodService,
  userService
} from '@/services';

interface DetailPageFilters {
  period_id: string;
  [key: string]: string | number;
}

const RPPSubmissionDetailPage: React.FC = () => {
  const { teacherId, periodId } = useParams<{
    teacherId?: string;
    periodId?: string;
  }>();
  const { isAdmin, isKepalaSekolah, isGuru } = useRole();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // URL Filters configuration for period selection (when teacherId is provided)
  const { updateURL, getCurrentFilters } = useURLFilters<DetailPageFilters>({
    defaults: {
      period_id: periodId || 'latest',
    },
    cleanDefaults: true,
  });

  const filters = getCurrentFilters();

  const [submission, setSubmission] = useState<RPPSubmissionResponse | null>(null);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Determine if this is a teacher's own submission or viewing someone else's
  const isOwnSubmission = isGuru() && currentUser?.id?.toString() === teacherId;
  const canReview = isKepalaSekolah() && submission?.status === RPPSubmissionStatus.PENDING;

  useEffect(() => {
    loadInitialData();
  }, [teacherId, periodId, filters.period_id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load periods if not using specific periodId
      if (!periodId) {
        await loadPeriods();
      }

      // Load teacher info if teacherId is provided
      if (teacherId) {
        await loadTeacher();
      }

      // Load submission data
      await loadSubmissionDetail();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPeriods = async () => {
    try {
      const response = await periodService.getPeriods();
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  const loadTeacher = async () => {
    if (!teacherId) return;

    try {
      const response = await userService.getUserById(Number(teacherId));
      setTeacher(response);
    } catch (error) {
      console.error('Error loading teacher:', error);
    }
  };

  const loadSubmissionDetail = async () => {
    try {
      let targetPeriodId: number;
      console.log(teacherId);

      if (periodId) {
        // Direct period access (from my-submission route)
        targetPeriodId = Number(periodId);
      } else if (teacherId) {
        // Teacher selection route - determine period from filters
        // if (periods.length === 0) return;

        if (filters.period_id === 'latest') {
          const sortedPeriods = [...periods].sort((a, b) => {
            if (a.academic_year !== b.academic_year) {
              return b.academic_year.localeCompare(a.academic_year);
            }
            return a.semester === 'Ganjil' ? 1 : -1;
          });
          targetPeriodId = sortedPeriods[0].id;
        } else {
          targetPeriodId = Number(filters.period_id);
        }
      } else {
        throw new Error('No teacher or period specified');
      }

      // Set current period
      const period = periods.find(p => p.id === targetPeriodId) || {
        id: targetPeriodId,
        academic_year: '',
        semester: '',
        name: '',
        status: 'active' as const,
        start_date: '',
        end_date: '',
        is_active: false,
        created_at: '',
        updated_at: undefined
      };
      setCurrentPeriod(period);

      // Load submission data
      let submissionData: RPPSubmissionResponse;
      console.log("hhhh");

      if (isOwnSubmission || periodId) {
        // Teacher viewing own submission or direct period access
        submissionData = await rppSubmissionService.getMySubmissionForPeriod(targetPeriodId);
      } else if (teacherId) {
        // Admin/kepala sekolah viewing teacher's submission
        // We need to find the submission for this teacher and period
        const submissionsResponse = await rppSubmissionService.getSubmissions({
          teacher_id: Number(teacherId),
          period_id: targetPeriodId,
          limit: 1,
          offset: 0
        });
        console.log(submissionsResponse);

        if (submissionsResponse.items && submissionsResponse.items.length > 0) {
          submissionData = submissionsResponse.items[0];
        } else {
          throw new Error('Submission not found for this teacher and period');
        }
      } else {
        throw new Error('Invalid access parameters');
      }

      setSubmission(submissionData);
      setReviewNotes(submissionData.review_notes || '');
    } catch (error: any) {
      console.error('Error loading submission detail:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memuat detail RPP submission.',
        variant: 'destructive'
      });
    }
  };

  const handlePeriodChange = (period_id: string) => {
    updateURL({ period_id });
  };

  // Note: handleFileUpload will be implemented when file upload component is ready
  // const handleFileUpload = async (rppType: RPPType, fileId: number) => {
  //   if (!submission) return;

  //   try {
  //     await rppSubmissionService.uploadRPPFile(
  //       submission.period_id,
  //       rppType,
  //       { file_id: fileId }
  //     );

  //     toast({
  //       title: 'Berhasil',
  //       description: `File ${rppSubmissionService.getRPPTypeDisplayName(rppType)} berhasil diupload.`,
  //     });

  //     // Reload submission data
  //     await loadSubmissionDetail();
  //   } catch (error: any) {
  //     console.error('Error uploading file:', error);
  //     toast({
  //       title: 'Error',
  //       description: error.message || 'Gagal upload file.',
  //       variant: 'destructive'
  //     });
  //   }
  // };

  const handleSubmitForApproval = async () => {
    if (!submission) return;

    if (!rppSubmissionService.isSubmissionReady(submission)) {
      toast({
        title: 'Tidak dapat submit',
        description: 'Pastikan semua RPP telah diupload sebelum submit.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await rppSubmissionService.submitForApproval(submission.id);
      toast({
        title: 'Berhasil',
        description: 'RPP submission berhasil disubmit untuk review.',
      });
      await loadSubmissionDetail();
    } catch (error: any) {
      console.error('Error submitting for approval:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal submit RPP submission.',
        variant: 'destructive'
      });
    }
  };

  const handleReview = async (status: RPPSubmissionStatus) => {
    if (!submission) return;

    try {
      setReviewing(true);
      await rppSubmissionService.reviewSubmission(submission.id, {
        status,
        review_notes: reviewNotes || undefined
      });

      const statusMessages: Record<RPPSubmissionStatus, string> = {
        [RPPSubmissionStatus.DRAFT]: 'Status berhasil diubah ke draft.',
        [RPPSubmissionStatus.PENDING]: 'Status berhasil diubah ke pending.',
        [RPPSubmissionStatus.APPROVED]: 'RPP submission berhasil disetujui.',
        [RPPSubmissionStatus.REJECTED]: 'RPP submission berhasil ditolak.',
      };

      toast({
        title: 'Berhasil',
        description: statusMessages[status] || 'Review berhasil disimpan.',
      });

      await loadSubmissionDetail();
    } catch (error: any) {
      console.error('Error reviewing submission:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal mereview RPP submission.',
        variant: 'destructive'
      });
    } finally {
      setReviewing(false);
    }
  };

  const getStatusIcon = (status: RPPSubmissionStatus) => {
    switch (status) {
      case RPPSubmissionStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case RPPSubmissionStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case RPPSubmissionStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RPPSubmissionStatus) => {
    return rppSubmissionService.getStatusColor(status);
  };

  const renderRPPItem = (item: RPPSubmissionItemResponse) => {
    const canUpload = isOwnSubmission &&
      (submission?.status === RPPSubmissionStatus.DRAFT);

    return (
      <Card key={item.id}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{item.rpp_type_display_name}</CardTitle>
            <Badge variant={item.is_uploaded ? "default" : "secondary"}>
              {item.is_uploaded ? "Uploaded" : "Belum Upload"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {item.is_uploaded ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{item.file_name}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Belum ada file yang diupload</p>
              </div>
            )}

            {canUpload && (
              <div className="flex justify-end">
                <Button
                  variant={item.is_uploaded ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    // This would open a file upload dialog
                    // Implementation depends on your file upload component
                    console.log('Upload file for', item.rpp_type);
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {item.is_uploaded ? "Ganti File" : "Upload File"}
                </Button>
              </div>
            )}

            {item.uploaded_at && (
              <p className="text-xs text-gray-500">
                Diupload: {new Date(item.uploaded_at).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Check access
  const hasAccess = isAdmin() || isKepalaSekolah() || isOwnSubmission;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Submission Tidak Ditemukan</h2>
          <p className="text-muted-foreground">
            Submission RPP untuk periode ini tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  const canSubmitForApproval = isOwnSubmission &&
    submission.status === RPPSubmissionStatus.DRAFT &&
    rppSubmissionService.isSubmissionReady(submission);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwnSubmission ? "RPP Submission Saya" : `RPP Submission - ${teacher?.profile?.name || teacher?.display_name || 'Unknown'}`}
        description={`Detail RPP submission untuk periode ${currentPeriod?.academic_year} - ${currentPeriod?.semester}`}
        actions={
          <div className="flex space-x-2">
            {canSubmitForApproval && (
              <Button onClick={handleSubmitForApproval}>
                <Send className="h-4 w-4 mr-2" />
                Submit untuk Approval
              </Button>
            )}
          </div>
        }
      />

      {/* Period Filter (only for teacher view) */}
      {teacherId && !periodId && periods.length > 0 && (
        <Filtering>
          <div className="space-y-2">
            <Label htmlFor="period-filter">Periode</Label>
            <Select value={filters.period_id} onValueChange={handlePeriodChange}>
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
      )}

      {/* Submission Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status Submission</CardTitle>
            <div className="flex items-center space-x-2">
              {getStatusIcon(submission.status)}
              <Badge variant="outline" className={`text-${getStatusColor(submission.status)}-600`}>
                {rppSubmissionService.getStatusDisplayName(submission.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Progress</Label>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${submission.completion_percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {submission.completion_percentage}% Complete
                </p>
              </div>
            </div>

            {submission.submitted_at && (
              <div>
                <Label>Tanggal Submit</Label>
                <p className="text-sm mt-1">
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>
              </div>
            )}

            {submission.reviewed_at && (
              <div>
                <Label>Tanggal Review</Label>
                <p className="text-sm mt-1">
                  {new Date(submission.reviewed_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {submission.review_notes && (
            <div className="mt-4">
              <Label>Catatan Review</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{submission.review_notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RPP Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">RPP Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submission.items.map(renderRPPItem)}
        </div>
      </div>

      {/* Review Section (for kepala sekolah) */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Review Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="review-notes">Catatan Review</Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Berikan catatan untuk guru..."
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleReview(RPPSubmissionStatus.APPROVED)}
                  disabled={reviewing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Setujui
                </Button>
                <Button
                  onClick={() => handleReview(RPPSubmissionStatus.REJECTED)}
                  disabled={reviewing}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RPPSubmissionDetailPage;