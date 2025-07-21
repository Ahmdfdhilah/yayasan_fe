import { BaseService } from "../base";
import {
  DashboardResponse,
  TeacherDashboard,
  PrincipalDashboard,
  AdminDashboard,
  QuickStats,
  DashboardQueryParams,
  QuickStatsQueryParams,
} from "./types";

class DashboardService extends BaseService {
  constructor() {
    super("/dashboard");
  }

  async getDashboard(params: DashboardQueryParams): Promise<DashboardResponse> {
    const queryString = new URLSearchParams({
      period_id: params.period_id.toString(),
      ...(params.organization_id && { organization_id: params.organization_id.toString() }),
      ...(params.include_inactive !== undefined && { include_inactive: params.include_inactive.toString() }),
    }).toString();

    return this.get(`/?${queryString}`);
  }

  async getTeacherDashboard(params: { period_id: number }): Promise<TeacherDashboard> {
    const queryString = new URLSearchParams({
      period_id: params.period_id.toString(),
    }).toString();

    return this.get(`/teacher?${queryString}`);
  }

  async getPrincipalDashboard(params: { period_id: number }): Promise<PrincipalDashboard> {
    const queryString = new URLSearchParams({
      period_id: params.period_id.toString(),
    }).toString();

    return this.get(`/principal?${queryString}`);
  }

  async getAdminDashboard(params: DashboardQueryParams): Promise<AdminDashboard> {
    const queryString = new URLSearchParams({
      period_id: params.period_id.toString(),
      ...(params.organization_id && { organization_id: params.organization_id.toString() }),
    }).toString();

    return this.get(`/admin?${queryString}`);
  }

  async getQuickStats(params: QuickStatsQueryParams): Promise<QuickStats> {
    const queryString = new URLSearchParams({
      period_id: params.period_id.toString(),
    }).toString();

    return this.get(`/quick-stats?${queryString}`);
  }
}

export const dashboardService = new DashboardService();