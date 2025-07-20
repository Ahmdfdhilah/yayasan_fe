// apps/vite-react-app/src/services/rpp-submissions/service.ts
import { BaseService } from "../base";
import {
  RPPSubmissionCreate,
  RPPSubmissionUpdate,
  RPPSubmissionReview,
  RPPSubmissionResubmit,
  RPPSubmissionResponse,
  RPPSubmissionListResponse,
  RPPSubmissionFilterParams,
} from "./types";

class RPPSubmissionService extends BaseService {
  constructor() {
    super("/rpp-submissions");
  }

  // Create RPP submission (Teachers only)
  async createRPPSubmission(
    submissionData: RPPSubmissionCreate
  ): Promise<RPPSubmissionResponse> {
    return this.post("/", submissionData);
  }

  // List RPP submissions with filtering
  async getRPPSubmissions(
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
    
    const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : "/";
    return this.get(endpoint);
  }

  // Get RPP submission by ID
  async getRPPSubmissionById(
    submissionId: number
  ): Promise<RPPSubmissionResponse> {
    return this.get(`/${submissionId}`);
  }

  // Update RPP submission (Teachers only, pending submissions)
  async updateRPPSubmission(
    submissionId: number,
    submissionData: RPPSubmissionUpdate
  ): Promise<RPPSubmissionResponse> {
    return this.put(`/${submissionId}`, submissionData);
  }

  // Review RPP submission (Principals only)
  async reviewRPPSubmission(
    submissionId: number,
    reviewData: RPPSubmissionReview
  ): Promise<RPPSubmissionResponse> {
    return this.post(`/${submissionId}/review`, reviewData);
  }

  // Resubmit RPP submission (Teachers only)
  async resubmitRPPSubmission(
    submissionId: number,
    resubmitData: RPPSubmissionResubmit
  ): Promise<RPPSubmissionResponse> {
    return this.post(`/${submissionId}/resubmit`, resubmitData);
  }

  // Helper methods for filtering

  // Get submissions by teacher
  async getSubmissionsByTeacher(
    teacherId: number,
    params?: Omit<RPPSubmissionFilterParams, 'teacher_id'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getRPPSubmissions({
      ...params,
      teacher_id: teacherId,
    });
  }

  // Get submissions by period
  async getSubmissionsByPeriod(
    periodId: number,
    params?: Omit<RPPSubmissionFilterParams, 'period_id'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getRPPSubmissions({
      ...params,
      period_id: periodId,
    });
  }

  // Get submissions by reviewer
  async getSubmissionsByReviewer(
    reviewerId: number,
    params?: Omit<RPPSubmissionFilterParams, 'reviewer_id'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getRPPSubmissions({
      ...params,
      reviewer_id: reviewerId,
    });
  }

  // Get submissions needing review
  async getSubmissionsNeedingReview(
    params?: Omit<RPPSubmissionFilterParams, 'needs_review'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getRPPSubmissions({
      ...params,
      needs_review: true,
    });
  }

  // Get submissions by status
  async getSubmissionsByStatus(
    status: RPPSubmissionFilterParams['status'],
    params?: Omit<RPPSubmissionFilterParams, 'status'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getRPPSubmissions({
      ...params,
      status,
    });
  }

  // Get pending submissions
  async getPendingSubmissions(
    params?: Omit<RPPSubmissionFilterParams, 'status'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getSubmissionsByStatus('pending', params);
  }

  // Get approved submissions
  async getApprovedSubmissions(
    params?: Omit<RPPSubmissionFilterParams, 'status'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getSubmissionsByStatus('approved', params);
  }

  // Get rejected submissions
  async getRejectedSubmissions(
    params?: Omit<RPPSubmissionFilterParams, 'status'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getSubmissionsByStatus('rejected', params);
  }

  // Get submissions needing revision
  async getRevisionNeededSubmissions(
    params?: Omit<RPPSubmissionFilterParams, 'status'>
  ): Promise<RPPSubmissionListResponse> {
    return this.getSubmissionsByStatus('revision_needed', params);
  }
}

export const rppSubmissionService = new RPPSubmissionService();