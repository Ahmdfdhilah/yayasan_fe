// apps/vite-react-app/src/services/statistics/service.ts
import { BaseService } from "../base";
import {
  StatisticCreate,
  StatisticUpdate,
  StatisticResponse,
  StatisticListResponse,
  StatisticFilterParams,
  MessageResponse,
} from "./types";

class StatisticService extends BaseService {
  constructor() {
    super("/statistics");
  }

  // List statistics with filtering
  async getStatistics(
    params?: StatisticFilterParams
  ): Promise<StatisticListResponse> {
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

  // Get all statistics ordered by display_order (using main endpoint with no pagination)
  async getAllStatistics(): Promise<StatisticResponse[]> {
    const result = await this.getStatistics({ size: 100 });
    return result.items;
  }

  // Create new statistic with optional image upload (requires auth)
  async createStatistic(
    data: StatisticCreate,
    image?: File
  ): Promise<StatisticResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.post("/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get statistic by ID
  async getStatisticById(
    statisticId: number
  ): Promise<StatisticResponse> {
    return this.get(`/${statisticId}`);
  }

  // Update statistic with optional image upload (requires auth)
  async updateStatistic(
    statisticId: number,
    data: StatisticUpdate,
    image?: File
  ): Promise<StatisticResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.put(`/${statisticId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete statistic (requires auth)
  async deleteStatistic(
    statisticId: number,
    hardDelete: boolean = false
  ): Promise<MessageResponse> {
    const queryParams = new URLSearchParams();
    if (hardDelete) {
      queryParams.append("hard_delete", "true");
    }
    
    const endpoint = queryParams.toString() ? `/${statisticId}?${queryParams.toString()}` : `/${statisticId}`;
    return this.delete(endpoint);
  }

  // Soft delete statistic (default behavior)
  async softDeleteStatistic(
    statisticId: number
  ): Promise<MessageResponse> {
    return this.deleteStatistic(statisticId, false);
  }

  // Hard delete statistic (permanent deletion)
  async hardDeleteStatistic(
    statisticId: number
  ): Promise<MessageResponse> {
    return this.deleteStatistic(statisticId, true);
  }

  // Helper method to get statistics for display (public endpoint)
  async getPublicStatistics(): Promise<StatisticResponse[]> {
    return this.getAllStatistics();
  }

  // Helper method to search statistics
  async searchStatistics(
    query: string,
    params?: Partial<StatisticFilterParams>
  ): Promise<StatisticListResponse> {
    const searchParams: StatisticFilterParams = {
      search: query,
      ...params
    };
    return this.getStatistics(searchParams);
  }

  // Helper method to get statistics with pagination
  async getStatisticsPaginated(
    page: number = 1,
    size: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StatisticListResponse> {
    const params: StatisticFilterParams = {
      page,
      size,
      search,
      sort_by: sortBy,
      sort_order: sortOrder
    };
    return this.getStatistics(params);
  }
}

export const statisticService = new StatisticService();