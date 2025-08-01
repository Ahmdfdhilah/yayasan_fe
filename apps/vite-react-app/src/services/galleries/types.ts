// apps/vite-react-app/src/services/galleries/types.ts

import { PaginatedResponse } from "../base/types";

// Gallery Types
export interface Gallery {
  id: number;
  img_url: string;
  title: string;
  excerpt?: string;
  is_highlight: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  short_excerpt: string;
}

// Request Types
export interface GalleryCreate {
  title: string;
  excerpt?: string;
  is_highlight?: boolean;
}

export interface GalleryUpdate {
  title?: string;
  excerpt?: string;
  is_highlight?: boolean;
}

export interface GalleryHighlightUpdate {
  gallery_id: number;
  is_highlight: boolean;
}

// Response Types
export interface GalleryResponse extends Gallery {}

export interface GalleryListResponse extends PaginatedResponse<Gallery> {}

export interface GallerySummary {
  id: number;
  img_url: string;
  title: string;
  is_highlight: boolean;
}


// Filter Types
export interface GalleryFilterParams {
  page?: number;
  size?: number;
  search?: string;
  is_highlighted?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Statistics Types
export interface GalleryStatistics {
  total_galleries: number;
  highlighted_galleries: number;
  non_highlighted_galleries: number;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}