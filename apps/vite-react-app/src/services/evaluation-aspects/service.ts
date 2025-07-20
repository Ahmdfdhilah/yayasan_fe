// apps/vite-react-app/src/services/evaluation-aspects/service.ts

import { BaseService } from '../base/service';
import type {
  EvaluationAspectCreate,
  EvaluationAspectUpdate,
  EvaluationAspectResponse,
  EvaluationAspectSummary,
  EvaluationAspectListResponse,
  EvaluationAspectFilterParams,
  MessageResponse,
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

  // Get all active evaluation aspects
  async getActiveEvaluationAspects(): Promise<EvaluationAspectSummary[]> {
    return this.get('/active/list');
  }

  // Get aspects by category
  async getAspectsByCategory(category: string): Promise<EvaluationAspectSummary[]> {
    return this.get(`/category/${category}`);
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
  async deleteEvaluationAspect(aspectId: number, force = false): Promise<MessageResponse> {
    const endpoint = force ? `/${aspectId}?force=true` : `/${aspectId}`;
    return this.delete(endpoint);
  }

  // Get unique categories
  async getCategories(): Promise<string[]> {
    const response = await this.getEvaluationAspects();
    const categories = new Set(response.items.map((aspect: any) => aspect.category));
    return Array.from(categories).sort();
  }
}

export const evaluationAspectService = new EvaluationAspectService();