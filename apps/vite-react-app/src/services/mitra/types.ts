// apps/vite-react-app/src/services/mitra/types.ts
// Mitra Types
export interface Mitra {
  id: number;
  title: string;
  description?: string;
  img_url?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

// Mitra Request Types
export interface MitraCreate {
  title: string;
  description?: string;
}

export interface MitraUpdate {
  title?: string;
  description?: string;
}

// Response Types
export interface MitraResponse extends Mitra {}

// Filter Types
export interface MitraFilterParams {
  skip?: number;
  limit?: number;
  search?: string;
}

// List Response with proper pagination structure
export interface MitraListResponse {
  items: Mitra[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}