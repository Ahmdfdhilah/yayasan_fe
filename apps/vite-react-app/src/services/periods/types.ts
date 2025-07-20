// apps/vite-react-app/src/services/periods/types.ts

import { PaginatedResponse } from "../base/types";

// PKG Period Types
export interface Period {
  id: number;
  academic_year: string;
  semester: string;
  start_date: string;
  end_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

// Request Types
export interface PeriodCreate {
  academic_year: string;
  semester: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface PeriodUpdate {
  academic_year?: string;
  semester?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

// Response Types
export interface PeriodResponse extends Period {}

export interface PeriodWithStats extends Period {
  total_teachers: number;
  total_evaluations: number;
  total_rpp_submissions: number;
}

export interface PeriodListResponse extends PaginatedResponse<Period> {}

// Filter Types
export interface PeriodFilterParams {
  academic_year?: string;
  semester?: string;
  is_active?: boolean;
  skip?: number;
  limit?: number;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success: boolean;
  data?: object;
}