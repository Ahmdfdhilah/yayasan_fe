// apps/vite-react-app/src/services/teacher-evaluations/service.ts
import { BaseService } from "../base";
import {
  TeacherEvaluationCreate,
  TeacherEvaluationUpdate,
  TeacherEvaluationResponse,
  TeacherEvaluationListResponse,
  TeacherEvaluationFilterParams,
  TeacherEvaluationMessageResponse,
  AssignTeachersToPeriodRequest,
  AssignTeachersResponse,
  TeacherEvaluationBulkUpdate,
  CompleteTeacherEvaluation,
  PeriodEvaluationStats,
  BulkOperationResponse,
} from "./types";

class TeacherEvaluationService extends BaseService {
  constructor() {
    super("/teacher-evaluations");
  }

  // ===== BASIC CRUD OPERATIONS (sesuai backend) =====

  // Create new teacher evaluation
  async createTeacherEvaluation(
    evaluationData: TeacherEvaluationCreate
  ): Promise<TeacherEvaluationResponse> {
    return this.post("/", evaluationData);
  }

  // Get teacher evaluation by ID
  async getTeacherEvaluation(
    evaluationId: number
  ): Promise<TeacherEvaluationResponse> {
    return this.get(`/${evaluationId}`);
  }

  // Update teacher evaluation
  async updateTeacherEvaluation(
    evaluationId: number,
    evaluationData: TeacherEvaluationUpdate
  ): Promise<TeacherEvaluationResponse> {
    return this.put(`/${evaluationId}`, evaluationData);
  }

  // Delete teacher evaluation (admin only)
  async deleteTeacherEvaluation(
    evaluationId: number
  ): Promise<TeacherEvaluationMessageResponse> {
    return this.delete(`/${evaluationId}`);
  }

  // ===== PERIOD-BASED OPERATIONS (sesuai backend endpoints) =====

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
    
    const endpoint = queryParams.toString() 
      ? `/period/${periodId}?${queryParams.toString()}` 
      : `/period/${periodId}`;
    return this.get(endpoint);
  }

  // Get teacher evaluations in specific period
  async getTeacherEvaluationsInPeriod(
    teacherId: number,
    periodId: number,
    params?: Omit<TeacherEvaluationFilterParams, 'teacher_id' | 'period_id'>
  ): Promise<TeacherEvaluationListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/teacher/${teacherId}/period/${periodId}?${queryParams.toString()}` 
      : `/teacher/${teacherId}/period/${periodId}`;
    return this.get(endpoint);
  }

  // ===== BULK OPERATIONS (sesuai backend) =====

  // Assign teachers to period (bulk assignment)
  async assignTeachersToPeriod(
    assignmentData: AssignTeachersToPeriodRequest
  ): Promise<AssignTeachersResponse> {
    return this.post("/assign-teachers-to-period", assignmentData);
  }

  // Bulk update grades
  async bulkUpdateGrades(
    bulkUpdateData: TeacherEvaluationBulkUpdate
  ): Promise<BulkOperationResponse> {
    return this.patch("/bulk-grade", bulkUpdateData);
  }

  // Complete teacher evaluation (all aspects for a teacher in period)
  async completeTeacherEvaluation(
    completionData: CompleteTeacherEvaluation
  ): Promise<BulkOperationResponse> {
    return this.post("/complete-teacher-evaluation", completionData);
  }

  // ===== STATISTICS (sesuai backend) =====

  // Get period evaluation statistics
  async getPeriodEvaluationStats(
    periodId: number
  ): Promise<PeriodEvaluationStats> {
    return this.get(`/period/${periodId}/stats`);
  }

  // ===== GRADE SPECIFIC OPERATIONS (sesuai backend) =====

  // Update evaluation grade (alternative endpoint)
  async updateEvaluationGrade(
    evaluationId: number,
    evaluationData: TeacherEvaluationUpdate
  ): Promise<TeacherEvaluationResponse> {
    return this.put(`/${evaluationId}/grade`, evaluationData);
  }

  // ===== HELPER METHODS FOR FRONTEND CONVENIENCE =====

  // Get all evaluations with filtering (untuk general listing)
  async getAllEvaluations(
    params?: TeacherEvaluationFilterParams
  ): Promise<TeacherEvaluationListResponse> {
    // Karena backend tidak punya endpoint umum untuk listing,
    // kita perlu gunakan period-based endpoint atau filter
    if (params?.period_id) {
      const { period_id, ...otherParams } = params;
      return this.getEvaluationsByPeriod(period_id, otherParams);
    }
    
    // Fallback: buat query params untuk endpoint root jika ada
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    // Note: Backend mungkin tidak punya endpoint ini, 
    // perlu diskusi dengan backend developer
    const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : "/";
    return this.get(endpoint);
  }

  // Get evaluations by teacher (across all periods)
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
    
    queryParams.append('teacher_id', teacherId.toString());
    
    // Gunakan endpoint umum dengan filter teacher_id
    const endpoint = `/?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  // Get evaluations by evaluator
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
    
    queryParams.append('evaluator_id', evaluatorId.toString());
    
    // Gunakan endpoint umum dengan filter evaluator_id
    const endpoint = `/?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  // ===== HELPER METHODS UNTUK GRUP EVALUATIONS =====

  // Helper: Group evaluations by teacher for display
  groupEvaluationsByTeacher(evaluations: TeacherEvaluationResponse[]) {
    const grouped = evaluations.reduce((acc, evaluation) => {
      const teacherId = evaluation.teacher_id;
      if (!acc[teacherId]) {
        acc[teacherId] = {
          teacher: {
            id: evaluation.teacher_id,
            name: evaluation.teacher_name || 'Unknown',
            email: evaluation.teacher_email || '',
          },
          evaluations: [],
          totalScore: 0,
          averageScore: 0,
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0 }
        };
      }
      
      acc[teacherId].evaluations.push(evaluation);
      acc[teacherId].totalScore += evaluation.score;
      acc[teacherId].gradeDistribution[evaluation.grade]++;
      acc[teacherId].averageScore = acc[teacherId].totalScore / acc[teacherId].evaluations.length;
      
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }

  // Helper: Group evaluations by aspect for analysis
  groupEvaluationsByAspect(evaluations: TeacherEvaluationResponse[]) {
    const grouped = evaluations.reduce((acc, evaluation) => {
      const aspectId = evaluation.aspect_id;
      if (!acc[aspectId]) {
        acc[aspectId] = {
          aspect: {
            id: evaluation.aspect_id,
            name: evaluation.aspect_name || 'Unknown',
            category: evaluation.aspect_category || '',
          },
          evaluations: [],
          averageScore: 0,
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0 }
        };
      }
      
      acc[aspectId].evaluations.push(evaluation);
      acc[aspectId].gradeDistribution[evaluation.grade]++;
      
      const totalScore = acc[aspectId].evaluations.reduce((sum: any, evaluation: { score: any; }) => sum + evaluation.score, 0);
      acc[aspectId].averageScore = totalScore / acc[aspectId].evaluations.length;
      
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }

  // Helper: Calculate completion percentage for teacher in period
  calculateTeacherCompletion(evaluations: TeacherEvaluationResponse[], totalAspects: number) {
    const completedCount = evaluations.length; // Semua evaluation yang ada berarti sudah completed
    return {
      completed: completedCount,
      total: totalAspects,
      percentage: totalAspects > 0 ? (completedCount / totalAspects) * 100 : 0
    };
  }
}

export const teacherEvaluationService = new TeacherEvaluationService();