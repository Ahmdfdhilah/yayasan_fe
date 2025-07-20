// apps/vite-react-app/src/services/evaluation-aspects/types.ts

import { PaginatedResponse } from "../base/types";

// Evaluation Aspect Types
export interface EvaluationAspect {
  id: number;
  aspect_name: string;
  category: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  evaluation_count: number;
}

// Request Types
export interface EvaluationAspectCreate {
  aspect_name: string;
  category: string;
  description?: string;
  is_active?: boolean;
}

export interface EvaluationAspectUpdate {
  aspect_name?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
}

// Response Types
export interface EvaluationAspectResponse extends EvaluationAspect {}

export interface EvaluationAspectSummary {
  id: number;
  aspect_name: string;
  category: string;
  is_active: boolean;
}

export interface EvaluationAspectListResponse extends PaginatedResponse<EvaluationAspect> {}

// Filter Types
export interface EvaluationAspectFilterParams {
  category?: string;
  is_active?: boolean;
  has_evaluations?: boolean;
  created_after?: string;
  created_before?: string;
  skip?: number;
  limit?: number;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  q?: string;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success: boolean;
  data?: object;
}