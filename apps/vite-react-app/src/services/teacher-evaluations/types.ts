// apps/vite-react-app/src/services/teacher-evaluations/types.ts

import { PaginatedResponse } from "../base/types";
import { User } from "../users/types";
import { Period } from "../periods/types";
import { EvaluationAspect } from "../evaluation-aspects/types";

// Sesuaikan dengan backend model yang sebenarnya
export interface TeacherEvaluation {
  id: number;
  teacher_id: number;
  teacher?: User;
  evaluator_id: number;
  evaluator?: User;
  aspect_id: number; // Backend: satu evaluation per aspect
  aspect?: EvaluationAspect;
  period_id: number;
  period?: Period;
  grade: EvaluationGrade; // A, B, C, D
  score: number; // Computed from grade (A=4, B=3, C=2, D=1)
  notes?: string;
  evaluation_date: string;
  created_at: string;
  updated_at?: string;
  
  // Backend response fields
  grade_description?: string;
  evaluator_name?: string;
  teacher_name?: string;
  teacher_email?: string;
  aspect_name?: string;
  aspect_category?: string;
  period_name?: string;
}

// Grade types (sesuai backend enum)
export type EvaluationGrade = 'A' | 'B' | 'C' | 'D';

// Grade labels and scores mapping (sesuai backend)
export const EVALUATION_GRADES = {
  A: { label: 'Excellent', score: 4 },
  B: { label: 'Good', score: 3 },
  C: { label: 'Satisfactory', score: 2 },
  D: { label: 'Needs Improvement', score: 1 }
} as const;

// Request Types (sesuai backend schemas)
export interface TeacherEvaluationCreate {
  teacher_id: number;
  evaluator_id: number;
  aspect_id: number;
  period_id: number;
  grade: EvaluationGrade;
  notes?: string;
}

export interface TeacherEvaluationUpdate {
  grade?: EvaluationGrade;
  notes?: string;
}

export interface TeacherEvaluationBulkCreate {
  evaluator_id: number;
  teacher_id: number;
  period_id: number;
  evaluations: Array<{
    aspect_id: number;
    grade: EvaluationGrade;
    notes?: string;
  }>;
}

export interface TeacherEvaluationBulkUpdate {
  evaluations: Array<{
    evaluation_id: number;
    grade: EvaluationGrade;
    notes?: string;
  }>;
}

export interface AssignTeachersToPeriodRequest {
  period_id: number;
}

export interface CompleteTeacherEvaluation {
  teacher_id: number;
  period_id: number;
  evaluations: Record<number, EvaluationGrade>; // aspect_id -> grade
}

// Response Types
export interface TeacherEvaluationResponse extends TeacherEvaluation {}

export interface TeacherEvaluationListResponse extends PaginatedResponse<TeacherEvaluation> {}

// Teacher summary for period stats
export interface TeacherEvaluationSummary {
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  period_id: number;
  period_name: string;
  total_aspects: number;
  completed_evaluations: number;
  average_score: number;
  grade_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  completion_percentage: number;
}

// Period evaluation statistics
export interface CategoryStats {
  category: string;
  total_evaluations: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
}

export interface PeriodEvaluationStats {
  total_evaluations: number;
  total_score: number;
  category_stats: CategoryStats[];
  period_id: number;
  period_name: string;
  total_teachers: number;
  total_aspects: number;
  total_possible_evaluations: number;
  completed_evaluations: number;
  completion_percentage: number;
  average_score: number;
  grade_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  teacher_summaries: TeacherEvaluationSummary[];
}

// Filter Types (sesuai backend filter params)
export interface TeacherEvaluationFilterParams {
  // Pagination
  page?: number;
  size?: number;
  
  // Search and sorting
  q?: string; // Search query (backend pakai 'q' bukan 'search')
  sort_by?: string;
  sort_order?: "asc" | "desc";
  
  // Date filters
  start_date?: string;
  end_date?: string;
  
  // Evaluation-specific filters
  teacher_id?: number;
  evaluator_id?: number;
  aspect_id?: number; // Backend punya ini
  period_id?: number;
  grade?: EvaluationGrade;
}

// Response wrapper for operations
export interface TeacherEvaluationMessageResponse {
  message: string;
  success?: boolean;
  data?: TeacherEvaluation | TeacherEvaluation[];
}

// Bulk assignment response
export interface AssignTeachersResponse {
  created_count: number;
  errors: string[];
  message: string;
}

// Bulk operation response
export interface BulkOperationResponse {
  updated_count?: number;
  created_count?: number;
  total_aspects?: number;
  errors: string[];
  message: string;
}