
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface StatusResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}


export interface FilterOption {
  label: string;
  value: string;
}

export interface SortOption {
  field: string;
  order: "asc" | "desc";
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortOption[];
}

// Common shared types to avoid export conflicts
export interface MessageResponse {
  message: string;
}

export interface FileUrls {
  preview?: string;
  download?: string;
}

export interface FileMetadata {
  filename: string;
  size: number;
  content_type: string;
}

export interface SuratTugasInfo {
  id: number;
  nomor_surat: string;
  nama_kegiatan: string;
  tempat_kegiatan: string;
  waktu_mulai_kegiatan: string;
  waktu_selesai_kegiatan: string;
  tim_auditor: string[];
}