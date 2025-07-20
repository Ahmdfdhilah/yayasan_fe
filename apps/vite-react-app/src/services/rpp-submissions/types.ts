// apps/vite-react-app/src/services/rpp-submissions/types.ts

import { PaginatedResponse } from "../base/types";

// RPP Status Enum
export type RPPStatus = "pending" | "approved" | "rejected" | "revision_needed";

// Core RPP Submission Interface
export interface RPPSubmission {
  id: number;
  teacher_id: number;
  period_id: number;
  rpp_type: string;
  file_id: number;
  status: RPPStatus;
  reviewer_id?: number;
  review_notes?: string;
  revision_count: number;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at?: string;
  // Status flags
  is_pending: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  needs_revision: boolean;
  // Related data
  teacher_name?: string;
  reviewer_name?: string;
  file_name?: string;
  period_name?: string;
}

// Request Types
export interface RPPSubmissionCreate {
  period_id: number;
  rpp_type: string;
  file_id: number;
  teacher_id: number;
}

export interface RPPSubmissionUpdate {
  rpp_type?: string;
  file_id?: number;
}

export interface RPPSubmissionReview {
  action: "approve" | "reject" | "revision";
  review_notes?: string;
}

export interface RPPSubmissionResubmit {
  file_id: number;
  notes?: string;
}

// Response Types
export interface RPPSubmissionResponse extends RPPSubmission {}

export interface RPPSubmissionListResponse extends PaginatedResponse<RPPSubmission> {}

// Filter Types
export interface RPPSubmissionFilterParams {
  page?: number;
  size?: number;
  teacher_id?: number;
  reviewer_id?: number;
  period_id?: number;
  rpp_type?: string;
  status?: RPPStatus;
  has_reviewer?: boolean;
  needs_review?: boolean;
  submitted_after?: string;
  submitted_before?: string;
  reviewed_after?: string;
  reviewed_before?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Helper Types
export interface RPPStatusInfo {
  status: RPPStatus;
  label: string;
  color: string;
  icon: string;
}

// Response wrapper for operations
export interface RPPMessageResponse {
  message: string;
  success: boolean;
  data?: object;
}