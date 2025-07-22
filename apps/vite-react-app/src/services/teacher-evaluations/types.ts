// apps/vite-react-app/src/services/teacher-evaluations/types.ts

import { PaginatedResponse } from "../base/types";
import { User } from "../users/types";
import { Period } from "../periods/types";
import { EvaluationAspect } from "../evaluation-aspects/types";

// Parent teacher evaluation (refactored backend structure)
export interface TeacherEvaluation {
  id: number;
  teacher_id: number;
  teacher?: User;
  evaluator_id: number;
  evaluator?: User;
  period_id: number;
  period?: Period;
  
  // Auto-calculated aggregate fields
  total_score: number;
  average_score: number;
  final_grade: number; // Calculated as total_score * 1.25
  
  // Summary fields
  final_notes?: string;
  last_updated: string;
  created_at?: string;
  updated_at?: string;
  organization_name?: string;
  
  // Child relationships
  items: TeacherEvaluationItem[];
}

// Individual aspect evaluation items (children)
export interface TeacherEvaluationItem {
  id: number;
  teacher_evaluation_id: number;
  aspect_id: number;
  aspect?: EvaluationAspect;
  grade: EvaluationGrade;
  score: number; // Auto-calculated from grade
  notes?: string;
  evaluated_at: string;
  created_at?: string;
  updated_at?: string;
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

// Request Types (updated for parent-child structure)
export interface TeacherEvaluationCreate {
  teacher_id: number;
  evaluator_id: number;
  period_id: number;
  final_notes?: string;
}

export interface TeacherEvaluationWithItemsCreate {
  teacher_id: number;
  evaluator_id: number;
  period_id: number;
  final_notes?: string;
  items: TeacherEvaluationItemCreate[];
}

export interface TeacherEvaluationItemCreate {
  aspect_id: number;
  grade: EvaluationGrade;
  notes?: string;
}

export interface TeacherEvaluationUpdate {
  final_notes?: string;
}

export interface TeacherEvaluationItemUpdate {
  grade?: EvaluationGrade;
  notes?: string;
}

export interface UpdateEvaluationItemGrade {
  grade: EvaluationGrade;
  notes?: string;
}

export interface UpdateEvaluationFinalNotes {
  final_notes?: string;
}

export interface TeacherEvaluationBulkItemUpdate {
  item_updates: Array<{
    aspect_id: number;
    grade: EvaluationGrade;
    notes?: string;
  }>;
}

export interface AssignTeachersToEvaluationPeriod {
  period_id: number;
}

// Response Types
export interface TeacherEvaluationItemResponse extends TeacherEvaluationItem {}

export interface TeacherEvaluationResponse extends TeacherEvaluation {}

export interface TeacherEvaluationListResponse extends PaginatedResponse<TeacherEvaluation> {}

// Summary and statistics types (updated to match backend)
export interface TeacherEvaluationSummary {
  teacher_id: number;
  teacher_name: string;
  period_id: number;
  total_aspects: number;
  completed_aspects: number;
  total_score: number;
  average_score: number;
  final_grade: number;
  completion_percentage: number;
  last_updated?: string;
}

export interface PeriodEvaluationStats {
  period_id: number;
  total_evaluations: number;
  total_teachers: number;
  completed_evaluations: number;
  total_aspects_evaluated: number;
  average_score: number;
  final_grade_distribution: {
    A?: number;
    B?: number;
    C?: number;
    D?: number;
  };
  completion_percentage: number;
  top_performers: Array<{
    teacher_id: number;
    teacher_name: string;
    total_score: number;
    average_score: number;
    final_grade: number;
    final_grade_letter: string;
    organization_name: string;
  }>;
  aspect_performance: Array<{
    aspect_name: string;
    average_score: number;
    total_evaluations: number;
  }>;
}

// Filter Types (updated to match backend)
export interface TeacherEvaluationFilterParams {
  // Pagination
  skip?: number;
  limit?: number;
  
  // Evaluation-specific filters
  teacher_id?: number;
  evaluator_id?: number;
  period_id?: number;
  search?: string;
  final_grade?: number;
  min_average_score?: number;
  max_average_score?: number;
  has_final_notes?: boolean;
  from_date?: string;
  to_date?: string;
}

// Response wrapper for bulk assign operations
export interface AssignTeachersToEvaluationPeriodResponse {
  success: boolean;
  message: string;
  period_name: string;
  created_evaluations: number;
  skipped_evaluations: number;
}

// Response wrapper for operations
export interface MessageResponse {
  message: string;
  success?: boolean;
}