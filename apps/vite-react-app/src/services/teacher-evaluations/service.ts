// apps/vite-react-app/src/services/teacher-evaluations/service.ts
import { BaseService } from "../base";
import {
  TeacherEvaluationCreate,
  TeacherEvaluationWithItemsCreate,
  TeacherEvaluationItemCreate,
  UpdateEvaluationItemGrade,
  UpdateEvaluationFinalNotes,
  TeacherEvaluationBulkItemUpdate,
  AssignTeachersToEvaluationPeriod,
  AssignTeachersToEvaluationPeriodResponse,
  TeacherEvaluationResponse,
  TeacherEvaluationDetailResponse,
  TeacherEvaluationItemResponse,
  TeacherEvaluationListResponse,
  TeacherEvaluationFilterParams,
  TeacherEvaluationSummary,
  TeacherEvaluationItem,
  PeriodEvaluationStats,
  MessageResponse,
} from "./types";

class TeacherEvaluationService extends BaseService {
  constructor() {
    super("/teacher-evaluations");
  }

  // ===== PARENT EVALUATION OPERATIONS =====

  // Create new teacher evaluation (parent record)
  async createTeacherEvaluation(
    evaluationData: TeacherEvaluationCreate
  ): Promise<TeacherEvaluationResponse> {
    return this.post("/", evaluationData);
  }

  // Create evaluation with items (parent + children)
  async createEvaluationWithItems(
    evaluationData: TeacherEvaluationWithItemsCreate
  ): Promise<TeacherEvaluationDetailResponse> {
    return this.post("/with-items", evaluationData);
  }

  // Get teacher evaluation by ID (returns detail with items)
  async getTeacherEvaluation(
    evaluationId: number
  ): Promise<TeacherEvaluationDetailResponse> {
    return this.get(`/${evaluationId}`);
  }

  // Update evaluation final notes
  async updateEvaluationFinalNotes(
    evaluationId: number,
    updateData: UpdateEvaluationFinalNotes
  ): Promise<TeacherEvaluationResponse> {
    return this.put(`/${evaluationId}/final-notes`, updateData);
  }

  // Delete teacher evaluation (admin only)
  async deleteTeacherEvaluation(
    evaluationId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${evaluationId}`);
  }

  // ===== EVALUATION ITEM OPERATIONS =====

  // Create evaluation item for specific aspect
  async createEvaluationItem(
    evaluationId: number,
    itemData: TeacherEvaluationItemCreate
  ): Promise<TeacherEvaluationItemResponse> {
    return this.post(`/${evaluationId}/items`, itemData);
  }

  // Update evaluation item for specific aspect
  async updateEvaluationItem(
    evaluationId: number,
    aspectId: number,
    itemData: UpdateEvaluationItemGrade
  ): Promise<TeacherEvaluationItemResponse> {
    return this.put(`/${evaluationId}/items/${aspectId}`, itemData);
  }

  // Delete evaluation item for specific aspect
  async deleteEvaluationItem(
    evaluationId: number,
    aspectId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${evaluationId}/items/${aspectId}`);
  }

  // Bulk update evaluation items
  async bulkUpdateEvaluationItems(
    evaluationId: number,
    bulkData: TeacherEvaluationBulkItemUpdate
  ): Promise<TeacherEvaluationDetailResponse> {
    return this.patch(`/${evaluationId}/bulk-items`, bulkData);
  }

  // ===== QUERY OPERATIONS =====

  // Get filtered teacher evaluations
  async getTeacherEvaluationsFiltered(
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

  // Get teacher evaluation by period (evaluator no longer needed - one teacher per period has one evaluator)
  async getTeacherEvaluationByPeriod(
    teacherId: number,
    periodId: number
  ): Promise<TeacherEvaluationDetailResponse> {
    return this.get(`/teacher/${teacherId}/period/${periodId}`);
  }

  // Get evaluations by period (returns detailed evaluations with items)
  async getEvaluationsByPeriod(
    periodId: number
  ): Promise<TeacherEvaluationDetailResponse[]> {
    return this.get(`/period/${periodId}`);
  }

  // ===== BULK OPERATIONS =====

  // Assign teachers to period (bulk assignment)
  async assignTeachersToPeriod(
    assignmentData: AssignTeachersToEvaluationPeriod
  ): Promise<AssignTeachersToEvaluationPeriodResponse> {
    return this.post("/assign-teachers-to-period", assignmentData);
  }

  // ===== STATISTICS AND ANALYTICS =====

  // Get period evaluation statistics
  async getPeriodEvaluationStats(
    periodId: number
  ): Promise<PeriodEvaluationStats> {
    return this.get(`/period/${periodId}/stats`);
  }

  // Get teacher evaluation summary
  async getTeacherEvaluationSummary(
    teacherId: number,
    periodId: number
  ): Promise<TeacherEvaluationSummary> {
    return this.get(`/teacher/${teacherId}/period/${periodId}/summary`);
  }

  // ===== HELPER METHODS FOR FRONTEND CONVENIENCE =====

  // Get evaluations by teacher (using filtered endpoint)
  async getEvaluationsByTeacher(
    teacherId: number,
    params?: Omit<TeacherEvaluationFilterParams, 'teacher_id'>
  ): Promise<TeacherEvaluationListResponse> {
    return this.getTeacherEvaluationsFiltered({
      ...params,
      teacher_id: teacherId
    });
  }

  // Get evaluations by evaluator (using filtered endpoint)
  async getEvaluationsByEvaluator(
    evaluatorId: number,
    params?: Omit<TeacherEvaluationFilterParams, 'evaluator_id'>
  ): Promise<TeacherEvaluationListResponse> {
    return this.getTeacherEvaluationsFiltered({
      ...params,
      evaluator_id: evaluatorId
    });
  }

  // ===== HELPER METHODS FOR CALCULATION =====

  // Calculate completion percentage for evaluation
  calculateCompletionPercentage(evaluation: TeacherEvaluationDetailResponse, totalAspects: number): number {
    const completedItems = evaluation.items?.length || 0;
    return totalAspects > 0 ? (completedItems / totalAspects) * 100 : 0;
  }

  // Get final grade description
  getFinalGradeDescription(finalGrade: number): string {
    if (finalGrade >= 87.5) return "Excellent (A)";
    if (finalGrade >= 62.5) return "Good (B)";
    if (finalGrade >= 37.5) return "Satisfactory (C)";
    return "Needs Improvement (D)";
  }

  // Group evaluation items by aspect for analysis
  groupItemsByAspect(items: TeacherEvaluationItem[]) {
    const grouped = items.reduce((acc, item) => {
      const aspectId = item.aspect_id;
      if (!acc[aspectId]) {
        acc[aspectId] = {
          aspect_id: aspectId,
          aspect: item.aspect,
          items: [],
          average_score: 0,
          grade_distribution: { A: 0, B: 0, C: 0, D: 0 }
        };
      }
      
      acc[aspectId].items.push(item);
      if (item.grade) {
        acc[aspectId].grade_distribution[item.grade]++;
      }
      
      const totalScore = acc[aspectId].items.reduce((sum: number, evalItem: TeacherEvaluationItem) => sum + (evalItem?.score || 0), 0);
      acc[aspectId].average_score = totalScore / acc[aspectId].items.length;
      
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }
}

export const teacherEvaluationService = new TeacherEvaluationService();