// Types for Media Files service layer - Updated to match backend
import { MessageResponse, PaginatedResponse } from "../base/types";

// ===== MEDIA FILE TYPES =====
export interface MediaFileBase {
  file_name: string;
  file_type: string;
  mime_type: string;
  file_path: string;
  file_size: number;
  uploader_id?: number | null;
  organization_id?: number | null;
  file_metadata?: Record<string, any> | null;
  is_public: boolean;
}

export interface MediaFileCreate extends MediaFileBase {
  // All fields are required for creation
}

export interface MediaFileUpdate {
  file_name?: string;
  file_metadata?: Record<string, any> | null;
  is_public?: boolean;
  organization_id?: number | null;
}

export interface MediaFileResponse extends MediaFileBase {
  id: number;
  created_at: string;
  updated_at?: string | null;
  
  // Computed fields from backend
  display_name: string;
  extension: string;
  file_size_formatted: string;
  file_category: string;
  can_preview: boolean;
  
  // Related data
  uploader_name?: string | null;
  organization_name?: string | null;
}

export interface MediaFileUploadResponse {
  id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  is_public: boolean;
  upload_url: string;
  message: string;
}

export interface MediaFileViewResponse {
  file_path: string;
  file_name: string;
  mime_type: string;
  view_url: string;
}

// ===== LIST RESPONSES =====
export interface MediaFileListResponse extends PaginatedResponse<MediaFileResponse> {}

// ===== SUMMARY TYPE =====
export interface MediaFileSummary {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  is_public: boolean;
  created_at: string;
  file_size_formatted: string;
  file_category: string;
}

// ===== FILTER TYPES =====
export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface SearchParams {
  q?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DateRangeFilter {
  start_date?: string; // ISO date string
  end_date?: string;   // ISO date string
}

export interface MediaFileFilterParams extends PaginationParams, SearchParams, DateRangeFilter {
  // File-specific filters
  file_type?: string;
  file_category?: string;
  uploader_id?: number;
  organization_id?: number;
  is_public?: boolean;
  min_size?: number;
  max_size?: number;
}

// ===== MESSAGE RESPONSE =====
export interface MediaFileMessageResponse extends MessageResponse {}

// ===== UPLOAD FORM DATA =====
export interface MediaFileUploadData {
  file: File;
  is_public?: boolean;
}

// ===== URL RESPONSE =====
export interface FileUrlResponse {
  file_id: number;
  file_name: string;
  file_url: string;
  thumbnail_url?: string | null;
  expires_at?: string | null;
}

// ===== BULK OPERATIONS =====
export interface FileBulkDelete {
  file_ids: number[];
  force_delete?: boolean;
}

export interface FileBulkUpdate {
  file_ids: number[];
  is_public?: boolean;
  organization_id?: number;
}

export interface FileMetadataUpdate {
  metadata: Record<string, any>;
}

// ===== ANALYTICS =====
export interface FileStorageAnalytics {
  total_files: number;
  total_size_bytes: number;
  total_size_formatted: string;
  by_type: Record<string, Record<string, any>>;
  by_category: Record<string, Record<string, any>>;
  by_organization: Record<string, Record<string, any>>;
  public_files: number;
  private_files: number;
  recent_uploads: number;
}

export interface FileUploadStats {
  uploads_today: number;
  uploads_this_week: number;
  uploads_this_month: number;
  uploads_by_day: Record<string, number>;
  top_uploaders: Array<Record<string, any>>;
  popular_file_types: Array<Record<string, any>>;
}