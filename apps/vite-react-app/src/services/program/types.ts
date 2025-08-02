// apps/vite-react-app/src/services/program/types.ts

import { PaginatedResponse } from "../base/types";

// Program Types
export interface Program {
  id: number;
  title: string;
  excerpt?: string;
  description?: string;
  img_url?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

// Program Request Types
export interface ProgramCreate {
  title: string;
  excerpt?: string;
  description?: string;
}

export interface ProgramUpdate {
  title?: string;
  excerpt?: string;
  description?: string;
}

// Response Types
export interface ProgramResponse extends Program {}
export interface ProgramListResponse extends PaginatedResponse<Program> {}

// Filter Types
export interface ProgramFilterParams {
  skip?: number;
  limit?: number;
  search?: string;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}