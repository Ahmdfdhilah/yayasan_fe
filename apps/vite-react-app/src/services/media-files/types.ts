// Types for Media Files service layer
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
  file_metadata?: object | null;
  is_public: boolean;
}

export interface MediaFileCreate extends Partial<MediaFileBase> {
  // File upload is handled via multipart/form-data
}

export interface MediaFileUpdate {
  file_name?: string;
  file_metadata?: object | null;
  is_public?: boolean;
}

export interface MediaFileResponse extends MediaFileBase {
  id: number;
  created_at: string;
  updated_at?: string | null;
  
  // Computed fields
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
  file: MediaFileResponse;
  upload_url?: string | null;
}

// ===== LIST RESPONSES =====
export interface MediaFileListResponse extends PaginatedResponse<MediaFileResponse> {}

// ===== FILTER TYPES =====
export interface MediaFileFilterParams {
  page?: number;
  size?: number;
  q?: string;
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