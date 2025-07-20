// apps/vite-react-app/src/services/teacher-evaluations/types.ts

import { PaginatedResponse } from "../base/types";
import { User } from "../users/types";
import { Period } from "../periods/types";
import { EvaluationAspect } from "../evaluation-aspects/types";

// PKG Teacher Evaluation Types
export interface TeacherEvaluation {
  id: number;
  teacher_id: number;
  teacher: User;
  evaluator_id: number;
  evaluator: User;
  period_id: number;
  period: Period;
  status: TeacherEvaluationStatus;
  total_score?: number;
  final_grade?: string; // A, B, C, D
  notes?: string;
  submitted_at?: string;
  created_at: string;
  updated_at?: string;
}

// Evaluation Status
export type TeacherEvaluationStatus = 
  | 'pending'      // Belum dimulai evaluasi
  | 'in_progress'  // Sedang proses evaluasi
  | 'completed'    // Evaluasi selesai dan submitted
  | 'draft';       // Draft (saved but not submitted)

// Individual Aspect Evaluation Data
export interface EvaluationData {
  id?: number;
  teacher_evaluation_id: number;
  aspect_id: number;
  aspect?: EvaluationAspect;
  rating: EvaluationRating; // A, B, C, D
  score: number; // 4, 3, 2, 1
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Rating types
export type EvaluationRating = 'A' | 'B' | 'C' | 'D';

// Rating labels and scores mapping
export const EVALUATION_RATINGS = {
  A: { label: 'Sangat Baik', score: 4 },
  B: { label: 'Baik', score: 3 },
  C: { label: 'Cukup', score: 2 },
  D: { label: 'Perlu Perbaikan', score: 1 }
} as const;

// Request Types
export interface TeacherEvaluationCreate {
  teacher_id: number;
  period_id: number;
  evaluator_id: number;
}

export interface TeacherEvaluationUpdate {
  evaluation_data?: EvaluationData[];
  notes?: string;
  status?: TeacherEvaluationStatus;
}

export interface AssignTeachersToPeriodRequest {
  period_id: number;
  teacher_ids: number[];
}

// Response Types
export interface TeacherEvaluationResponse extends TeacherEvaluation {}

export interface TeacherEvaluationWithDetails extends TeacherEvaluation {
  evaluation_data: EvaluationData[];
  aspects: EvaluationAspect[];
}

export interface TeacherEvaluationListResponse extends PaginatedResponse<TeacherEvaluation> {}

export interface TeacherEvaluationStats {
  total_evaluations: number;
  completed_evaluations: number;
  pending_evaluations: number;
  in_progress_evaluations: number;
  average_score?: number;
  grade_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

// Filter Types
export interface TeacherEvaluationFilterParams {
  teacher_id?: number;
  evaluator_id?: number;
  period_id?: number;
  organization_id?: number;
  status?: TeacherEvaluationStatus;
  grade?: EvaluationRating;
  search?: string; // Search by teacher name or evaluator name
  skip?: number;
  limit?: number;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// My Evaluations Filter (for teachers)
export interface MyEvaluationsFilterParams {
  period_id?: number;
  status?: TeacherEvaluationStatus;
  skip?: number;
  limit?: number;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Response wrapper for operations
export interface TeacherEvaluationMessageResponse {
  message: string;
  success: boolean;
  data?: TeacherEvaluation | TeacherEvaluation[];
}

// Bulk assignment response
export interface AssignTeachersResponse {
  message: string;
  success: boolean;
  created_evaluations: TeacherEvaluation[];
  existing_evaluations: TeacherEvaluation[];
  total_assigned: number;
}