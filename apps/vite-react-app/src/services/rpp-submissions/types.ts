// Types for RPP Submissions service layer
import { MessageResponse, PaginatedResponse } from "../base/types";

// ===== ENUMS =====
// RPPType enum removed - now supports flexible RPP submissions without type constraints

export enum RPPSubmissionStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING", 
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// ===== RPP SUBMISSION ITEM TYPES =====
export interface RPPSubmissionItemBase {
  teacher_id: number;
  period_id: number;
  name: string;
  description?: string | null;
  file_id?: number | null;
}

export interface RPPSubmissionItemCreate extends RPPSubmissionItemBase {}

export interface RPPSubmissionItemCreateRequest {
  name: string;
  description?: string | null;
}

export interface RPPSubmissionItemUpdateRequest {
  name: string;
  description?: string | null;
}

export interface RPPSubmissionItemUpdate {
  file_id: number;
}

export interface RPPSubmissionItemResponse extends RPPSubmissionItemBase {
  id: number;
  uploaded_at?: string | null;
  is_uploaded: boolean;
  created_at: string;
  updated_at?: string | null;
  
  // Nested data
  teacher_name?: string | null;
  period_name?: string | null;
  file_name?: string | null;
}

// ===== RPP SUBMISSION TYPES =====
export interface RPPSubmissionBase {
  teacher_id: number;
  period_id: number;
}

export interface RPPSubmissionCreate extends RPPSubmissionBase {}

export interface RPPSubmissionUpdate {
  status: RPPSubmissionStatus;
  review_notes?: string | null;
}

export interface RPPSubmissionSubmitRequest {
  // No additional fields needed
}

export interface RPPSubmissionReviewRequest {
  status: RPPSubmissionStatus;
  review_notes?: string | null;
}

export interface RPPSubmissionResponse extends RPPSubmissionBase {
  id: number;
  status: RPPSubmissionStatus;
  reviewer_id?: number | null;
  review_notes?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  completion_percentage: number;
  can_be_submitted: boolean;
  created_at: string;
  updated_at?: string | null;
  
  // Nested data
  teacher_name?: string | null;
  teacher_position?: string | null;
  organization_name?: string | null;
  reviewer_name?: string | null;
  period_name?: string | null;
  items: RPPSubmissionItemResponse[];
}

// ===== ADMIN TYPES =====
export interface GenerateRPPSubmissionsRequest {
  period_id: number;
}

export interface GenerateRPPSubmissionsResponse extends MessageResponse {
  success: boolean;
  message: string;
  period_name: string;
  created_evaluations: number;
  skipped_evaluations: number;
}

// ===== LIST RESPONSES =====
export interface RPPSubmissionItemListResponse extends PaginatedResponse<RPPSubmissionItemResponse> {}

export interface RPPSubmissionListResponse extends PaginatedResponse<RPPSubmissionResponse> {}

// ===== FILTER TYPES =====
export interface RPPSubmissionFilter {
  teacher_id?: number;
  period_id?: number;
  status?: RPPSubmissionStatus;
  reviewer_id?: number;
  organization_id?: number;
  submitted_after?: string;
  submitted_before?: string;
  reviewed_after?: string;
  reviewed_before?: string;
}

export interface RPPSubmissionItemFilter {
  teacher_id?: number;
  period_id?: number;
  is_uploaded?: boolean;
  organization_id?: number;
}

// ===== STATISTICS TYPES =====
export interface RPPSubmissionStats {
  total_submissions: number;
  draft_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  completion_rate: number;
}

export interface RPPSubmissionPeriodStats {
  period_id: number;
  period_name: string;
  stats: RPPSubmissionStats;
}

export interface RPPSubmissionOrganizationStats {
  organization_id: number;
  organization_name: string;
  stats: RPPSubmissionStats;
  periods: RPPSubmissionPeriodStats[];
}

// ===== DASHBOARD TYPES =====
export interface RPPSubmissionDashboard {
  current_period_stats?: RPPSubmissionPeriodStats | null;
  recent_submissions: RPPSubmissionResponse[];
  pending_reviews: RPPSubmissionResponse[];
  my_submissions: RPPSubmissionResponse[];
  overall_stats: RPPSubmissionStats;
}

// ===== SERVICE FILTER PARAMS =====
export interface RPPSubmissionFilterParams {
  organization_id?: number;
  teacher_id?: number;
  period_id?: number;
  status?: RPPSubmissionStatus;
  reviewer_id?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface RPPSubmissionItemFilterParams {
  teacher_id?: number;
  period_id?: number;
  is_uploaded?: boolean;
  limit?: number;
  offset?: number;
}

// ===== MESSAGE RESPONSE =====
export interface RPPSubmissionMessageResponse extends MessageResponse {}