// apps/vite-react-app/src/services/organizations/types.ts

import { PaginatedResponse } from "../base/types";

// PKG Organization Types
export interface Organization {
  id: number;
  name: string;
  description?: string;
  excerpt?: string;
  head_id?: number;
  created_at: string;
  updated_at?: string;
  display_name: string;
  user_count: number;
  head_name?: string;
}

// Request Types
export interface OrganizationCreate {
  name: string;
  description?: string;
  excerpt?: string;
  head_id?: number;
}

export interface OrganizationUpdate {
  name?: string;
  description?: string;
  excerpt?: string;
  head_id?: number;
}

// Response Types
export interface OrganizationResponse extends Organization {}

export interface OrganizationListResponse extends PaginatedResponse<Organization> {}

// Filter Types
export interface OrganizationFilterParams {
  page?: number;
  size?: number;
  q?: string;
  has_users?: boolean;
  has_head?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success: boolean;
  data?: object;
}