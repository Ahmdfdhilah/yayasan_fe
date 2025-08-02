// apps/vite-react-app/src/services/board-members/types.ts

import { PaginatedResponse } from "../base/types";

// Board Group Types
export interface BoardGroup {
  id: number;
  title: string;
  display_order: number;
  description?: string;
  created_at: string;
  updated_at?: string;
}

// Board Member Types
export interface BoardMember {
  id: number;
  name: string;
  position: string;
  group_id?: number;
  member_order: number;
  img_url?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  short_description: string;
}

// Board Group Request Types
export interface BoardGroupCreate {
  title: string;
  display_order?: number;
  description?: string;
}

export interface BoardGroupUpdate {
  title?: string;
  display_order?: number;
  description?: string;
}

// Board Member Request Types
export interface BoardMemberCreate {
  name: string;
  position: string;
  group_id?: number;
  member_order?: number;
  description?: string;
}

export interface BoardMemberUpdate {
  name?: string;
  position?: string;
  group_id?: number;
  member_order?: number;
  description?: string;
}

// Response Types
export interface BoardGroupResponse extends BoardGroup {}
export interface BoardGroupListResponse extends PaginatedResponse<BoardGroup> {}

export interface BoardMemberResponse extends BoardMember {}
export interface BoardMemberListResponse extends PaginatedResponse<BoardMember> {}

// Filter Types
export interface BoardGroupFilterParams {
  page?: number;
  size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface BoardMemberFilterParams {
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