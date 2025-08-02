// apps/vite-react-app/src/services/statistics/types.ts

import { PaginatedResponse } from "../base/types";

// Statistic Types
export interface Statistic {
  id: number;
  title: string;
  description?: string;
  stats: string;
  img_url?: string;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

// Request Types
export interface StatisticCreate {
  title: string;
  description?: string;
  stats: string;
  display_order?: number;
}

export interface StatisticUpdate {
  title?: string;
  description?: string;
  stats?: string;
  display_order?: number;
}

// Response Types
export interface StatisticResponse extends Statistic {}

export interface StatisticListResponse extends PaginatedResponse<Statistic> {}

// Filter Types
export interface StatisticFilterParams {
  page?: number;
  size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}