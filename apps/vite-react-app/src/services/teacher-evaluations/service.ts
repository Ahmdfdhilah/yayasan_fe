// apps/vite-react-app/src/services/teacher-evaluations/service.ts
import { BaseService } from "../base";
import {
  TeacherEvaluationCreate,
  TeacherEvaluationUpdate,
  TeacherEvaluationResponse,
  TeacherEvaluationWithDetails,
  TeacherEvaluationListResponse,
  TeacherEvaluationFilterParams,
  MyEvaluationsFilterParams,
  TeacherEvaluationMessageResponse,
  AssignTeachersToPeriodRequest,
  AssignTeachersResponse,
  TeacherEvaluationStats,
} from "./types";

class TeacherEvaluationService extends BaseService {
  constructor() {
    super("/teacher-evaluations");
  }

  // List teacher evaluations with filtering
  async getTeacherEvaluations(
    params?: TeacherEvaluationFilterParams
  ): Promise<TeacherEvaluationListResponse> {
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

  // Get my evaluations (for teachers)
  async getMyEvaluations(
    params?: MyEvaluationsFilterParams
  ): Promise<TeacherEvaluationListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/my-evaluations?${queryParams.toString()}` : "/my-evaluations";
    return this.get(endpoint);
  }

  // Get teacher evaluation by ID
  async getTeacherEvaluation(
    evaluationId: number
  ): Promise<TeacherEvaluationResponse> {
    return this.get(`/${evaluationId}`);
  }

  // Get teacher evaluation with detailed data (aspects and evaluation data)
  async getTeacherEvaluationDetails(
    evaluationId: number
  ): Promise<TeacherEvaluationWithDetails> {
    return this.get(`/${evaluationId}/details`);
  }

  // Create new teacher evaluation
  async createTeacherEvaluation(
    evaluationData: TeacherEvaluationCreate
  ): Promise<TeacherEvaluationResponse> {
    return this.post("/", evaluationData);
  }

  // Update teacher evaluation
  async updateTeacherEvaluation(
    evaluationId: number,
    evaluationData: TeacherEvaluationUpdate
  ): Promise<TeacherEvaluationResponse> {
    return this.put(`/${evaluationId}`, evaluationData);
  }

  // Save evaluation as draft
  async saveEvaluationDraft(
    evaluationId: number,
    evaluationData: TeacherEvaluationUpdate
  ): Promise<TeacherEvaluationResponse> {
    return this.patch(`/${evaluationId}/draft`, evaluationData);
  }

  // Submit evaluation (final submission)
  async submitEvaluation(
    evaluationId: number,
    notes?: string
  ): Promise<TeacherEvaluationResponse> {
    return this.post(`/${evaluationId}/submit`, { notes });
  }

  // Assign teachers to period (bulk assignment)
  async assignTeachersToPeriod(
    assignmentData: AssignTeachersToPeriodRequest
  ): Promise<AssignTeachersResponse> {
    return this.post("/assign-teachers-to-period", assignmentData);
  }

  // Delete teacher evaluation
  async deleteTeacherEvaluation(
    evaluationId: number
  ): Promise<TeacherEvaluationMessageResponse> {
    return this.delete(`/${evaluationId}`);
  }

  // Get evaluation statistics
  async getEvaluationStats(
    params?: {
      period_id?: number;
      organization_id?: number;
      teacher_id?: number;
    }
  ): Promise<TeacherEvaluationStats> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/stats?${queryParams.toString()}` : "/stats";
    return this.get(endpoint);
  }

  // Get evaluations by period
  async getEvaluationsByPeriod(
    periodId: number,
    params?: Omit<TeacherEvaluationFilterParams, 'period_id'>
  ): Promise<TeacherEvaluationListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/period/${periodId}?${queryParams.toString()}` : `/period/${periodId}`;
    return this.get(endpoint);
  }

  // Get evaluations by teacher
  async getEvaluationsByTeacher(
    teacherId: number,
    params?: Omit<TeacherEvaluationFilterParams, 'teacher_id'>
  ): Promise<TeacherEvaluationListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/teacher/${teacherId}?${queryParams.toString()}` : `/teacher/${teacherId}`;
    return this.get(endpoint);
  }

  // Get evaluations by evaluator (kepala sekolah)
  async getEvaluationsByEvaluator(
    evaluatorId: number,
    params?: Omit<TeacherEvaluationFilterParams, 'evaluator_id'>
  ): Promise<TeacherEvaluationListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/evaluator/${evaluatorId}?${queryParams.toString()}` : `/evaluator/${evaluatorId}`;
    return this.get(endpoint);
  }

  // Reopen evaluation (change from completed back to in_progress)
  async reopenEvaluation(
    evaluationId: number
  ): Promise<TeacherEvaluationResponse> {
    return this.patch(`/${evaluationId}/reopen`);
  }
}

export const teacherEvaluationService = new TeacherEvaluationService();