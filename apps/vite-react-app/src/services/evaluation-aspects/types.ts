// apps/vite-react-app/src/services/evaluation-aspects/types.ts

import { PaginatedResponse } from "../base/types";

// Evaluation Aspect Types
export interface EvaluationAspect {
  id: number;
  aspect_name: string;
  category_id: number;
  category_name?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  evaluation_count: number;
}

// Request Types
export interface EvaluationAspectCreate {
  aspect_name: string;
  category_id: number;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface EvaluationAspectUpdate {
  aspect_name?: string;
  category_id?: number;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

// Response Types
export interface EvaluationAspectResponse extends EvaluationAspect { }

export interface EvaluationAspectSummary {
  id: number;
  aspect_name: string;
  category: string;
  is_active: boolean;
  created_at: string;
  evaluation_count: number;
}

export interface EvaluationAspectListResponse extends PaginatedResponse<EvaluationAspect> { }

// Filter Types
export interface EvaluationAspectFilterParams {
  category_id?: number;
  is_active?: boolean;
  has_evaluations?: boolean;
  created_after?: string;
  created_before?: string;
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

// ===== EVALUATION CATEGORY TYPES =====

export interface EvaluationCategory {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  aspects_count: number;
  active_aspects_count: number;
}

export interface EvaluationCategoryCreate {
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface EvaluationCategoryUpdate {
  name?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface EvaluationCategoryResponse extends EvaluationCategory { }

export interface EvaluationCategorySummary {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  aspects_count: number;
}

export interface CategoryWithAspectsResponse {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  aspects: EvaluationAspectResponse[];
}

// ===== BULK OPERATIONS =====

export interface EvaluationAspectBulkCreate {
  aspects: EvaluationAspectCreate[];
}

export interface EvaluationAspectBulkUpdate {
  aspect_ids: number[];
  is_active?: boolean;
}

export interface EvaluationAspectBulkDelete {
  aspect_ids: number[];
  force_delete?: boolean;
}

// ===== ORDERING SCHEMAS =====

export interface AspectOrderUpdate {
  aspect_id: number;
  new_order: number;
}

export interface CategoryOrderUpdate {
  category_id: number;
  new_order: number;
}

export interface CategoryAspectsReorder {
  category_id: number;
  aspect_orders: Record<number, number>;
}

// ===== ANALYTICS SCHEMAS =====

export interface EvaluationAspectAnalytics {
  total_aspects: number;
  active_aspects: number;
  inactive_aspects: number;
  most_used_aspects: Array<{ [key: string]: any }>;
  least_used_aspects: Array<{ [key: string]: any }>;
  avg_grade_by_aspect: Record<string, string>;
}

export interface AspectPerformanceAnalysis {
  aspect_id: number;
  aspect_name: string;
  total_evaluations: number;
  avg_grade: string;
  grade_distribution: Record<string, number>;
  trend_data: Array<{ [key: string]: any }>;
  top_performers: Array<{ [key: string]: any }>;
  improvement_needed: Array<{ [key: string]: any }>;
}

export interface EvaluationAspectStats {
  summary: EvaluationAspectAnalytics;
  aspect_performance: AspectPerformanceAnalysis[];
  usage_trends: Record<string, number[]>;
  recommendations: string[];
}