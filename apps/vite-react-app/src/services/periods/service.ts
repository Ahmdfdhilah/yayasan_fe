// apps/vite-react-app/src/services/periods/service.ts
import { BaseService } from "../base";
import {
  PeriodCreate,
  PeriodUpdate,
  PeriodResponse,
  PeriodWithStats,
  PeriodListResponse,
  PeriodFilterParams,
  MessageResponse,
} from "./types";

class PeriodService extends BaseService {
  constructor() {
    super("/periods");
  }

  // List periods with filtering
  async getPeriods(
    params?: PeriodFilterParams
  ): Promise<PeriodListResponse> {
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

  // Create new period
  async createPeriod(
    periodData: PeriodCreate
  ): Promise<PeriodResponse> {
    return this.post("/", periodData);
  }

  // Get period by ID
  async getPeriodById(
    periodId: number
  ): Promise<PeriodResponse> {
    return this.get(`/${periodId}`);
  }

  // Get period with statistics
  async getPeriodStats(
    periodId: number
  ): Promise<PeriodWithStats> {
    return this.get(`/${periodId}/stats`);
  }

  // Update period
  async updatePeriod(
    periodId: number,
    periodData: PeriodUpdate
  ): Promise<PeriodResponse> {
    return this.put(`/${periodId}`, periodData);
  }

  // Activate period
  async activatePeriod(
    periodId: number
  ): Promise<PeriodResponse> {
    return this.patch(`/${periodId}/activate`);
  }

  // Deactivate period
  async deactivatePeriod(
    periodId: number
  ): Promise<PeriodResponse> {
    return this.patch(`/${periodId}/deactivate`);
  }

  // Delete period
  async deletePeriod(
    periodId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${periodId}`);
  }


  // Get current periods (active by date)
  async getCurrentPeriods(): Promise<PeriodResponse[]> {
    return this.get("/current");
  }

  // Get single active period
  async getActivePeriod(): Promise<PeriodResponse> {
    return this.get("/active");
  }
}

export const periodService = new PeriodService();