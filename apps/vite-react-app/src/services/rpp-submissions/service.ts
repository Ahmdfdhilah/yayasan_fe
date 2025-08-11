// RPP Submissions Service Layer
import { BaseService } from "../base";
import {
  RPPSubmissionResponse,
  RPPSubmissionListResponse,
  RPPSubmissionFilterParams,
  RPPSubmissionMessageResponse,
  RPPSubmissionItemUpdate,
  RPPSubmissionItemResponse,
  RPPSubmissionItemListResponse,
  RPPSubmissionItemFilterParams,
  RPPSubmissionSubmitRequest,
  RPPSubmissionReviewRequest,
  GenerateRPPSubmissionsRequest,
  GenerateRPPSubmissionsResponse,
  RPPSubmissionStats,
  RPPSubmissionDashboard,
  RPPSubmissionStatus,
} from "./types";

class RPPSubmissionService extends BaseService {
  constructor() {
    super("/rpp-submissions");
  }

  // ===== ADMIN ENDPOINTS =====

  /**
   * Generate RPP submissions for all teachers in a period (Admin only)
   */
  async generateSubmissionsForPeriod(
    generateData: GenerateRPPSubmissionsRequest
  ): Promise<GenerateRPPSubmissionsResponse> {
    return this.post("/admin/generate-for-period", generateData);
  }

  // ===== TEACHER ENDPOINTS =====

  /**
   * Get current teacher's submissions
   */
  async getMySubmissions(
    params?: Omit<RPPSubmissionFilterParams, 'teacher_id'>
  ): Promise<RPPSubmissionListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/my-submissions?${queryParams.toString()}` 
      : "/my-submissions";
    return this.get(endpoint);
  }

  /**
   * Get my submission for specific period
   */
  async getMySubmissionForPeriod(
    periodId: number
  ): Promise<RPPSubmissionResponse> {
    return this.get(`/my-submission/${periodId}`);
  }

  /**
   * Upload RPP file
   */
  async uploadRPPFile(
    periodId: number,
    fileData: RPPSubmissionItemUpdate
  ): Promise<RPPSubmissionItemResponse> {
    return this.put(`/my-submission/${periodId}/upload`, fileData);
  }

  /**
   * Submit RPP for approval
   */
  async submitForApproval(
    submissionId: number,
    submitData: RPPSubmissionSubmitRequest = {}
  ): Promise<RPPSubmissionMessageResponse> {
    return this.post(`/my-submission/${submissionId}/submit`, submitData);
  }

  // ===== REVIEWER ENDPOINTS (KEPALA SEKOLAH) =====

  /**
   * Get submissions pending review
   */
  async getPendingReviews(
    params?: Pick<RPPSubmissionFilterParams, 'period_id' | 'teacher_id' | 'limit' | 'offset'>
  ): Promise<RPPSubmissionListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/pending-reviews?${queryParams.toString()}` 
      : "/pending-reviews";
    return this.get(endpoint);
  }

  /**
   * Review RPP submission
   */
  async reviewSubmission(
    submissionId: number,
    reviewData: RPPSubmissionReviewRequest
  ): Promise<RPPSubmissionMessageResponse> {
    return this.post(`/review/${submissionId}`, reviewData);
  }

  // ===== GENERAL QUERY ENDPOINTS =====

  /**
   * Get RPP submissions with filtering
   */
  async getSubmissions(
    params?: RPPSubmissionFilterParams
  ): Promise<RPPSubmissionListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/?${queryParams.toString()}` 
      : "/";
    return this.get(endpoint);
  }

  /**
   * Get submission details
   */
  async getSubmission(submissionId: number): Promise<RPPSubmissionResponse> {
    return this.get(`/${submissionId}`);
  }

  // ===== STATISTICS ENDPOINTS =====

  /**
   * Get submission statistics
   */
  async getSubmissionStatistics(
    periodId?: number
  ): Promise<RPPSubmissionStats> {
    const queryParams = new URLSearchParams();
    if (periodId) {
      queryParams.append('period_id', periodId.toString());
    }
    
    const endpoint = queryParams.toString() 
      ? `/statistics/overview?${queryParams.toString()}` 
      : "/statistics/overview";
    return this.get(endpoint);
  }

  /**
   * Get dashboard data
   */
  async getDashboardOverview(): Promise<RPPSubmissionDashboard> {
    return this.get("/dashboard/overview");
  }

  // ===== SUBMISSION ITEMS ENDPOINTS =====

  /**
   * Get submission items with filtering
   */
  async getSubmissionItems(
    params?: RPPSubmissionItemFilterParams
  ): Promise<RPPSubmissionItemListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/items/?${queryParams.toString()}` 
      : "/items/";
    return this.get(endpoint);
  }

  // ===== HELPER METHODS FOR FRONTEND CONVENIENCE =====

  /**
   * Get submissions by teacher across all periods
   */
  async getSubmissionsByTeacher(
    teacherId: number,
    params?: Omit<RPPSubmissionFilterParams, 'teacher_id'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getSubmissions({
      ...params,
      teacher_id: teacherId
    });
  }

  /**
   * Get submissions by period
   */
  async getSubmissionsByPeriod(
    periodId: number,
    params?: Omit<RPPSubmissionFilterParams, 'period_id'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getSubmissions({
      ...params,
      period_id: periodId
    });
  }

  /**
   * Get submissions by status
   */
  async getSubmissionsByStatus(
    status: RPPSubmissionStatus,
    params?: Omit<RPPSubmissionFilterParams, 'status'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getSubmissions({
      ...params,
      status
    });
  }

  /**
   * Check if submission can be submitted for approval
   */
  isSubmissionReady(submission: RPPSubmissionResponse): boolean {
    return submission.can_be_submitted && submission.items.length > 0;
  }


  /**
   * Get submission status display name
   */
  getStatusDisplayName(status: RPPSubmissionStatus): string {
    const displayNames = {
      [RPPSubmissionStatus.DRAFT]: "Draft",
      [RPPSubmissionStatus.PENDING]: "Menunggu Review",
      [RPPSubmissionStatus.APPROVED]: "Disetujui",
      [RPPSubmissionStatus.REJECTED]: "Ditolak"
    };
    return displayNames[status] || status;
  }

  /**
   * Get submission status color for UI
   */
  getStatusColor(status: RPPSubmissionStatus): string {
    const colors = {
      [RPPSubmissionStatus.DRAFT]: "gray",
      [RPPSubmissionStatus.PENDING]: "yellow",
      [RPPSubmissionStatus.APPROVED]: "green",
      [RPPSubmissionStatus.REJECTED]: "red"
    };
    return colors[status] || "gray";
  }

  /**
   * Group submissions by teacher for display
   */
  groupSubmissionsByTeacher(submissions: RPPSubmissionResponse[]) {
    const grouped = submissions.reduce((acc, submission) => {
      const teacherId = submission.teacher_id;
      if (!acc[teacherId]) {
        acc[teacherId] = {
          teacher: {
            id: submission.teacher_id,
            name: submission.teacher_name || 'Unknown',
          },
          submissions: [],
          totalSubmissions: 0,
          completedSubmissions: 0,
          averageCompletion: 0,
          statusDistribution: {
            draft: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          }
        };
      }
      
      acc[teacherId].submissions.push(submission);
      acc[teacherId].totalSubmissions++;
      
      if (submission.items.length > 0) {
        acc[teacherId].completedSubmissions++;
      }
      
      acc[teacherId].statusDistribution[submission.status]++;
      
      const totalCompletion = acc[teacherId].submissions.reduce(
        (sum: number, sub: RPPSubmissionResponse) => sum + sub.completion_percentage, 0
      );
      acc[teacherId].averageCompletion = totalCompletion / acc[teacherId].submissions.length;
      
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }

  /**
   * Group submissions by period for display
   */
  groupSubmissionsByPeriod(submissions: RPPSubmissionResponse[]) {
    const grouped = submissions.reduce((acc, submission) => {
      const periodId = submission.period_id;
      if (!acc[periodId]) {
        acc[periodId] = {
          period: {
            id: submission.period_id,
            name: submission.period_name || 'Unknown',
          },
          submissions: [],
          totalSubmissions: 0,
          completedSubmissions: 0,
          averageCompletion: 0,
          statusDistribution: {
            draft: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          }
        };
      }
      
      acc[periodId].submissions.push(submission);
      acc[periodId].totalSubmissions++;
      
      if (submission.items.length > 0) {
        acc[periodId].completedSubmissions++;
      }
      
      acc[periodId].statusDistribution[submission.status]++;
      
      const totalCompletion = acc[periodId].submissions.reduce(
        (sum: number, sub: RPPSubmissionResponse) => sum + sub.completion_percentage, 0
      );
      acc[periodId].averageCompletion = totalCompletion / acc[periodId].submissions.length;
      
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }

  /**
   * Calculate completion statistics for multiple submissions
   */
  calculateCompletionStats(submissions: RPPSubmissionResponse[]) {
    const total = submissions.length;
    if (total === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        completionRate: 0,
        averageCompletion: 0
      };
    }

    const completed = submissions.filter(s => s.items.length > 0).length;
    const inProgress = 0; // No longer applicable with new flexible system
    const notStarted = submissions.filter(s => s.items.length === 0).length;
    
    const totalCompletion = submissions.reduce((sum, sub) => sum + sub.completion_percentage, 0);
    const averageCompletion = totalCompletion / total;
    const completionRate = (completed / total) * 100;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate,
      averageCompletion
    };
  }
}

export const rppSubmissionService = new RPPSubmissionService();