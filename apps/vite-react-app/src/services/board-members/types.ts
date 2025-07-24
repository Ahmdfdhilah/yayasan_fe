// apps/vite-react-app/src/services/board-members/types.ts

import { PaginatedResponse } from "../base/types";

// Board Member Types
export interface BoardMember {
  id: number;
  name: string;
  position: string;
  img_url?: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  short_description: string;
}

// Request Types
export interface BoardMemberCreate {
  name: string;
  position: string;
  description?: string;
  display_order?: number;
}

export interface BoardMemberUpdate {
  name?: string;
  position?: string;
  description?: string;
  display_order?: number;
}

// Response Types
export interface BoardMemberResponse extends BoardMember {}

export interface BoardMemberListResponse extends PaginatedResponse<BoardMember> {}

export interface BoardMemberSummary {
  id: number;
  name: string;
  position: string;
  img_url?: string;
  display_order: number;
}

// Filter Types
export interface BoardMemberFilterParams {
  page?: number;
  size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Statistics Types
export interface BoardMemberStatistics {
  total_members: number;
  positions: string[];
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}