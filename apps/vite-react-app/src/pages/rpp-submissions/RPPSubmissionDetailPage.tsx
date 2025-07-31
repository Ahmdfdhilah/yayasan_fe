import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@workspace/ui/components/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import {
  Send
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import Filtering from '@/components/common/Filtering';
import {
  RPPSubmissionResponse,
  RPPSubmissionItemResponse,
  RPPSubmissionStatus,
} from '@/services/rpp-submissions/types';
import { RPPItemCard, RPPReviewSection, RPPSubmissionOverview } from '@/components/RPPSubmissions';
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
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Determine if this is user's own submission (teacher or principal)
  const isOwnSubmission = (isGuru() || isKepalaSekolah()) && currentUser?.id?.toString() === teacherId;

  // Kepala sekolah can review submissions from teachers in their organization
  // Admin can review submissions from principals (kepala sekolah)
  const canReview = submission?.status === RPPSubmissionStatus.PENDING && (
    (isKepalaSekolah() && teacher?.profile?.organization_id === currentUser?.profile?.organization_id) ||
    (isAdmin() && teacher?.roles?.includes('kepala_sekolah'))
  );

  // Admin can view all submissions 
  const isAdminView = isAdmin();

  // Kepala sekolah can view submissions from teachers in their organization
  const isKepalaSekolahView = isKepalaSekolah() &&
    teacher?.profile?.organization_id === currentUser?.profile?.organization_id;

  useEffect(() => {
    loadInitialData();
    loadActivePeriod();
  }, [teacherId, periodId, filters.period_id]);

  // Additional effect to load submission when periods are loaded
  useEffect(() => {
    if (periods.length > 0 && !periodId && teacherId) {
      loadSubmissionDetail();
    }
  }, [periods, teacherId, periodId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Always load periods first to ensure currentPeriod can be properly set
      await loadPeriods();

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
      const response = await periodService.getPeriods({ page: 1, size: 100 });
      setPeriods(response.items || []);
    } catch (error) {
      console.error('Error loading periods:', error);
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
        if (periods.length === 0) {
          console.log('Periods not loaded yet, waiting...');
          return;
        }

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

      // Get period by ID for display info
      if (!currentPeriod || currentPeriod.id !== targetPeriodId) {
        try {
          const periodResponse = await periodService.getPeriodById(targetPeriodId);
          setCurrentPeriod(periodResponse);
        } catch (error) {
          console.error('Error loading period by ID:', error);
          // Fallback to find from periods list
          const foundPeriod = periods.find(p => p.id === targetPeriodId);
          if (foundPeriod) {
            setCurrentPeriod(foundPeriod);
          }
        }
      }

      // Load submission data
      let submissionData: RPPSubmissionResponse;
      console.log("hhhh");

      if (isOwnSubmission || periodId) {
        // Teacher viewing own submission or direct period access
        try {
          submissionData = await rppSubmissionService.getMySubmissionForPeriod(targetPeriodId);
        } catch (error: any) {
          // If teacher doesn't have submission for this period, handle gracefully
          if (error.message?.includes('not found') || error.status === 404) {
            setSubmission(null);
            return;
          }
          throw error; // Re-throw other errors
        }
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
          // No submission found - this is not an error, just no data
          setSubmission(null);
          return;
        }
      } else {
        throw new Error('Invalid access parameters');
      }

      setSubmission(submissionData);
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

  const handleFileUploaded = async () => {
    await loadSubmissionDetail();
  };

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
      setSubmitDialogOpen(false);
      await loadSubmissionDetail();
    } catch (error: any) {
      console.error('Error submitting for approval:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal submit RPP submission.',
        variant: 'destructive'
      });
      setSubmitDialogOpen(false);
    }
  };

  const handleReviewComplete = async () => {
    await loadSubmissionDetail();
  };


  const renderRPPItem = (item: RPPSubmissionItemResponse) => {
    const isDraftStatus = submission?.status === RPPSubmissionStatus.DRAFT;
    const isRejectedStatus = submission?.status === RPPSubmissionStatus.REJECTED;
    const statusAllowsUpload = isDraftStatus || isRejectedStatus;
    const isActivePeriod = activePeriod && currentPeriod && activePeriod.id === currentPeriod.id;
    const canUpload = isOwnSubmission && statusAllowsUpload && isActivePeriod;

    return (
      <RPPItemCard
        key={item.id}
        item={item}
        canUpload={canUpload ?? false}
        submissionStatus={submission!.status}
        onFileUploaded={handleFileUploaded}
      />
    );
  };

  // Check access - more granular check
  const hasAccess = isOwnSubmission || isAdminView || isKepalaSekolahView;

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            {isKepalaSekolah()
              ? "Anda hanya dapat melihat RPP submission dari guru di Sekolah Anda."
              : "Anda tidak memiliki akses untuk melihat halaman ini."
            }
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

  const renderNoSubmissionState = () => (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center space-x-3">
            <span>
              {isOwnSubmission
                ? "RPP Submission Saya"
                : `RPP Submission - ${teacher?.profile?.name || teacher?.display_name || 'Unknown'}`
              }
            </span>
            {isAdminView && (
              <Badge variant="outline" className="text-blue-600">
                Admin View
              </Badge>
            )}
            {isKepalaSekolahView && (
              <Badge variant="outline" className="text-purple-600">
                Kepala Sekolah
              </Badge>
            )}
          </div>
        }
        description={
          <div>
            <p>
              {currentPeriod?.academic_year && currentPeriod?.semester
                ? `Detail RPP submission untuk periode ${currentPeriod.academic_year} - ${currentPeriod.semester}`
                : 'Detail RPP submission'}
            </p>
            {teacher?.profile?.organization_name && (
              <p className="text-sm text-muted-foreground mt-1">
                Sekolah: {teacher.profile.organization_name}
              </p>
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

      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Submission Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-4">
            Submission RPP untuk periode ini tidak ditemukan.
          </p>
          {teacherId && !periodId && periods.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Coba pilih periode lain menggunakan filter di atas untuk mencari submission RPP.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (!submission) {
    return renderNoSubmissionState();
  }

  const isActivePeriod = activePeriod && currentPeriod && activePeriod.id === currentPeriod.id;
  const canSubmitForApproval = isOwnSubmission &&
    (submission.status === RPPSubmissionStatus.DRAFT || submission.status === RPPSubmissionStatus.REJECTED) &&
    rppSubmissionService.isSubmissionReady(submission) &&
    isActivePeriod;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center space-x-3">
            <span>
              {isOwnSubmission
                ? "RPP Submission Saya"
                : `RPP Submission - ${teacher?.profile?.name || teacher?.display_name || 'Unknown'}`
              }
            </span>
            {isAdminView && (
              <Badge variant="outline" className="text-blue-600">
                Admin View
              </Badge>
            )}
            {isKepalaSekolahView && (
              <Badge variant="outline" className="text-purple-600">
                Kepala Sekolah
              </Badge>
            )}
          </div>
        }
        description={
          <div>
            <p>
              {currentPeriod?.academic_year && currentPeriod?.semester
                ? `Detail RPP submission untuk periode ${currentPeriod.academic_year} - ${currentPeriod.semester}`
                : 'Detail RPP submission'}
            </p>
            {teacher?.profile?.organization_name && (
              <p className="text-sm text-muted-foreground mt-1">
                Sekolah: {teacher.profile.organization_name}
              </p>
            )}
          </div>
        }
        actions={
          <div className="flex space-x-2">
            {canSubmitForApproval && (
              <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    {submission.status === RPPSubmissionStatus.REJECTED ? 'Submit Ulang' : 'Submit untuk Approval'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Submit</AlertDialogTitle>
                    <AlertDialogDescription>
                      {submission.status === RPPSubmissionStatus.REJECTED
                        ? 'Apakah Anda yakin ingin submit ulang RPP submission ini untuk review?'
                        : 'Apakah Anda yakin ingin submit RPP submission ini untuk review? Setelah disubmit, Anda tidak dapat mengubah file RPP hingga mendapat feedback.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmitForApproval}>
                      {submission.status === RPPSubmissionStatus.REJECTED ? 'Submit Ulang' : 'Submit'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {/* Show disabled button with tooltip for non-active periods */}
            {isOwnSubmission &&
              (submission.status === RPPSubmissionStatus.DRAFT || submission.status === RPPSubmissionStatus.REJECTED) &&
              rppSubmissionService.isSubmissionReady(submission) &&
              !isActivePeriod && (
                <Button disabled title="Upload dan submit hanya dapat dilakukan pada periode aktif">
                  <Send className="h-4 w-4 mr-2" />
                  {submission.status === RPPSubmissionStatus.REJECTED ? 'Submit Ulang' : 'Submit untuk Approval'}
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
      <RPPSubmissionOverview submission={submission} />

      {/* RPP Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">RPP Files</h3>
        <div className="grid grid-cols-1  gap-4">
          {submission.items.map(renderRPPItem)}
        </div>
      </div>

      {/* Review Section (for kepala sekolah and admin) */}
      {canReview && (
        <RPPReviewSection
          submission={submission}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </div>
  );
};

export default RPPSubmissionDetailPage;