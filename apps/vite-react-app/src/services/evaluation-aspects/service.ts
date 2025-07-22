// apps/vite-react-app/src/services/evaluation-aspects/service.ts

import { BaseService } from '../base/service';
import type {
  EvaluationAspectCreate,
  EvaluationAspectUpdate,
  EvaluationAspectResponse,
  EvaluationAspectListResponse,
  EvaluationAspectFilterParams,
  MessageResponse,
  EvaluationCategoryCreate,
  EvaluationCategoryResponse,
  CategoryWithAspectsResponse,
  EvaluationAspectBulkCreate,
  EvaluationAspectBulkUpdate,
  EvaluationAspectBulkDelete,
  AspectOrderUpdate,
  CategoryOrderUpdate,
  CategoryAspectsReorder,
  EvaluationAspectStats,
} from './types';

export class EvaluationAspectService extends BaseService {
  constructor() {
    super('/evaluation-aspects');
  }

  // Get all evaluation aspects with filtering and pagination
  async getEvaluationAspects(params?: EvaluationAspectFilterParams): Promise<EvaluationAspectListResponse> {
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

  // ===== ANALYTICS ENDPOINTS =====
  
  // Get comprehensive analytics and statistics
  async getComprehensiveAnalytics(): Promise<EvaluationAspectStats> {
    return this.get('/analytics');
  }

  // ===== CATEGORY MANAGEMENT =====
  
  // Create evaluation category (Admin only)
  async createCategory(categoryData: EvaluationCategoryCreate): Promise<EvaluationCategoryResponse> {
    return this.post('/categories', categoryData);
  }

  // Get all categories
  async getCategories(includeInactive = false): Promise<EvaluationCategoryResponse[]> {
    const params = includeInactive ? '?include_inactive=true' : '';
    return this.get(`/categories${params}`);
  }

  // Get aspects by category with proper ordering
  async getAspectsByCategoryOrdered(categoryId: number): Promise<EvaluationAspectResponse[]> {
    return this.get(`/categories/${categoryId}/aspects`);
  }

  // Get category with all its aspects
  async getCategoryWithAspects(categoryId: number): Promise<CategoryWithAspectsResponse> {
    return this.get(`/categories/${categoryId}/with-aspects`);
  }

  // Get evaluation aspect by ID
  async getEvaluationAspect(aspectId: number): Promise<EvaluationAspectResponse> {
    return this.get(`/${aspectId}`);
  }

  // Create evaluation aspect (Admin only)
  async createEvaluationAspect(aspectData: EvaluationAspectCreate): Promise<EvaluationAspectResponse> {
    return this.post('', aspectData);
  }

  // Update evaluation aspect (Admin only)
  async updateEvaluationAspect(aspectId: number, aspectData: EvaluationAspectUpdate): Promise<EvaluationAspectResponse> {
    return this.put(`/${aspectId}`, aspectData);
  }

  // Delete evaluation aspect (Admin only)
  async deleteEvaluationAspect(aspectId: number): Promise<MessageResponse> {
    return this.delete(`/${aspectId}`);
  }

  // Activate evaluation aspect (Admin only)
  async activateAspect(aspectId: number): Promise<EvaluationAspectResponse> {
    return this.patch(`/${aspectId}/activate`, {});
  }

  // Deactivate evaluation aspect (Admin only)
  async deactivateAspect(aspectId: number): Promise<EvaluationAspectResponse> {
    return this.patch(`/${aspectId}/deactivate`, {});
  }

  // ===== ORDERING ENDPOINTS =====
  
  // Update category display order (Admin only)
  async updateCategoryOrder(orderData: CategoryOrderUpdate): Promise<MessageResponse> {
    return this.put('/ordering/category', orderData);
  }

  // Update aspect display order (Admin only)
  async updateAspectOrder(orderData: AspectOrderUpdate): Promise<MessageResponse> {
    return this.put('/ordering/aspect', orderData);
  }

  // Reorder aspects within a category (Admin only)
  async reorderAspectsInCategory(reorderData: CategoryAspectsReorder): Promise<MessageResponse> {
    return this.put('/ordering/category/reorder', reorderData);
  }

  // Auto-assign orders to categories and aspects (Admin only)
  async autoAssignOrders(): Promise<MessageResponse> {
    return this.post('/ordering/auto-assign', {});
  }

  // ===== BULK OPERATIONS =====
  
  // Bulk create evaluation aspects (Admin only)
  async bulkCreateAspects(bulkData: EvaluationAspectBulkCreate): Promise<EvaluationAspectResponse[]> {
    return this.post('/bulk/create', bulkData);
  }

  // Bulk update evaluation aspects (Admin only)
  async bulkUpdateAspects(bulkData: EvaluationAspectBulkUpdate): Promise<MessageResponse> {
    return this.patch('/bulk/update', bulkData);
  }

  // Bulk delete evaluation aspects (Admin only)
  async bulkDeleteAspects(bulkData: EvaluationAspectBulkDelete): Promise<MessageResponse> {
    return this.delete('/bulk/delete', bulkData);
  }

  // Manual sync all active aspects to teacher evaluations (Admin only)
  async manualSyncAspects(): Promise<MessageResponse> {
    return this.post('/sync/manual', {});
  }
}

export const evaluationAspectService = new EvaluationAspectService();