import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
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
import { RPPItemCard, RPPReviewSection, RPPSubmissionOverview, CreateRPPItemDialog } from '@/components/RPPSubmissions';
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
  const { teacherId } = useParams<{
    teacherId?: string;
  }>();
  const { isAdmin, isKepalaSekolah, isGuru } = useRole();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // URL Filters configuration for period selection (when teacherId is provided)
  const { updateURL, getCurrentFilters } = useURLFilters<DetailPageFilters>({
    defaults: {
      period_id: '',
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
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);

  // Determine if this is user's own submission (teacher or principal)
  const isOwnSubmission = (isGuru() || isKepalaSekolah()) && currentUser?.id?.toString() === teacherId;

  // Kepala sekolah can review submissions from teachers in their organization (but NOT their own)
  // Admin can review submissions from principals (kepala sekolah)
  const canReview = submission?.status === RPPSubmissionStatus.PENDING && !isOwnSubmission && (
    (isKepalaSekolah() && teacher?.role === 'GURU' && teacher?.profile?.organization_id === currentUser?.profile?.organization_id) ||
    (isAdmin() && teacher?.role === 'KEPALA_SEKOLAH')
  );

  // Admin can view all submissions 
  const isAdminView = isAdmin();

  // Kepala sekolah can view submissions from teachers in their organization
  const isKepalaSekolahView = isKepalaSekolah() &&
    teacher?.profile?.organization_id === currentUser?.profile?.organization_id;

  useEffect(() => {
    loadInitialData();
    loadActivePeriod();
  }, [teacherId]);

  // Load submission when filter changes
  useEffect(() => {
    if (teacherId && filters.period_id && !isLoadingSubmission) {
      loadSubmissionDetail();
    }
  }, [filters.period_id, teacherId]);

  // Auto-select period only once when data is ready
  useEffect(() => {
    if (teacherId && periods.length > 0 && activePeriod && !filters.period_id) {
      updateURL({ period_id: activePeriod.id.toString() });
    }
  }, [activePeriod?.id]);

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
    // Prevent multiple concurrent calls
    if (isLoadingSubmission) {
      return;
    }

    setIsLoadingSubmission(true);

    try {
      let targetPeriodId: number;

      if (teacherId) {
        // Teacher selection route - determine period from filters
        if (!filters.period_id) {
          setIsLoadingSubmission(false);
          return;
        }

        targetPeriodId = Number(filters.period_id);
      } else {
        throw new Error('No teacher specified');
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

      if (isOwnSubmission) {
        // Teacher viewing own submission or direct period access
        try {
          submissionData = await rppSubmissionService.getMySubmissionForPeriod(targetPeriodId);
        } catch (error: any) {
          // If teacher doesn't have submission for this period, handle gracefully
          if (error.message?.includes('Pengajuan tidak ditemukan')) {
            setSubmission(null);
            setIsLoadingSubmission(false);
            return;
          }
          throw error; // Re-throw other errors
        }
      } else if (teacherId) {
        // Admin/kepala sekolah viewing teacher's submission
        const submissionsResponse = await rppSubmissionService.getSubmissions({
          teacher_id: Number(teacherId),
          period_id: targetPeriodId,
          limit: 1,
          offset: 0
        });

        if (submissionsResponse.items && submissionsResponse.items.length > 0) {
          submissionData = submissionsResponse.items[0];
        } else {
          // No submission found - this is not an error, just no data
          setSubmission(null);
          setIsLoadingSubmission(false);
          return;
        }
      } else {
        throw new Error('Invalid access parameters');
      }

      setSubmission(submissionData);
      console.log('Submission data loaded:', submissionData);
      console.log('Number of items:', submissionData?.items?.length || 0);
    } catch (error: any) {
      console.error('Error loading submission detail:', error);

      setSubmission(null);

      // Error handling is done in base service, no need to show toast here
    } finally {
      setIsLoadingSubmission(false);
    }
  };

  const handlePeriodChange = (period_id: string) => {
    updateURL({ period_id });
  };

  const handleFileUploaded = async () => {
    console.log('handleFileUploaded called, reloading submission detail...');
    await loadSubmissionDetail();
    console.log('loadSubmissionDetail completed');
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
        onItemDeleted={handleFileUploaded} // Same callback to refresh data
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
      {teacherId && periods.length > 0 && (
        <Filtering>
          <div className="space-y-2">
            <Label htmlFor="period-filter">Periode</Label>
            <Select value={filters.period_id} onValueChange={handlePeriodChange}>
              <SelectTrigger id="period-filter">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.academic_year} - {period.semester}
                    {period.is_active ? ' (Aktif)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Filtering>
      )}

      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">RPP Submission Belum Ada</h2>
          <p className="text-muted-foreground mb-4">
            {currentPeriod?.academic_year && currentPeriod?.semester
              ? `Belum ada RPP submission untuk periode ${currentPeriod.academic_year} - ${currentPeriod.semester}.`
              : 'Belum ada RPP submission untuk periode ini.'
            }
          </p>
          {teacherId && periods.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Pilih periode lain menggunakan filter di atas untuk mencari RPP submission.
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
      {teacherId && periods.length > 0 && (
        <Filtering>
          <div className="space-y-2">
            <Label htmlFor="period-filter">Periode</Label>
            <Select value={filters.period_id} onValueChange={handlePeriodChange}>
              <SelectTrigger id="period-filter">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.academic_year} - {period.semester}
                    {period.is_active ? ' (Aktif)' : ''}
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">RPP Files</h3>
          {(() => {
            const isDraftStatus = submission.status === RPPSubmissionStatus.DRAFT;
            const isRejectedStatus = submission.status === RPPSubmissionStatus.REJECTED;
            const statusAllowsUpload = isDraftStatus || isRejectedStatus;
            const isActivePeriod = activePeriod && currentPeriod && activePeriod.id === currentPeriod.id;
            const canCreateItem = isOwnSubmission && statusAllowsUpload && isActivePeriod;

            return canCreateItem && (
              <Button
                onClick={() => setCreateItemDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                Tambah Item
              </Button>
            );
          })()}
        </div>
        <div className="grid grid-cols-1  gap-4">
          {(() => {
            console.log('Rendering items:', submission.items);
            return submission.items.map(renderRPPItem);
          })()}
        </div>
      </div>

      {/* Review Section (for kepala sekolah and admin) */}
      {canReview && (
        <RPPReviewSection
          submission={submission}
          onReviewComplete={handleReviewComplete}
        />
      )}

      {/* Create Item Dialog */}
      <CreateRPPItemDialog
        open={createItemDialogOpen}
        onOpenChange={setCreateItemDialogOpen}
        periodId={currentPeriod?.id || 0}
        onSuccess={handleFileUploaded} // Same callback to refresh data
      />
    </div>
  );
};

export default RPPSubmissionDetailPage;