// apps/vite-react-app/src/services/galleries/types.ts

import { PaginatedResponse } from "../base/types";

// Gallery Types
export interface Gallery {
  id: number;
  img_url: string;
  title: string;
  excerpt?: string;
  display_order: number;
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
  display_order?: number;
}

export interface GalleryUpdate {
  title?: string;
  excerpt?: string;
  display_order?: number;
}

export interface GalleryOrderUpdate {
  gallery_id: number;
  new_order: number;
}

export interface GalleryBulkOrderUpdate {
  items: GalleryOrderUpdate[];
}

// Response Types
export interface GalleryResponse extends Gallery {}

export interface GalleryListResponse extends PaginatedResponse<Gallery> {}

export interface GallerySummary {
  id: number;
  img_url: string;
  title: string;
  display_order: number;
}

export interface OrderUpdateResult {
  gallery_id: number;
  old_order: number;
  new_order: number;
  success: boolean;
  message?: string;
}

export interface BulkOrderUpdateResponse {
  successful_updates: OrderUpdateResult[];
  failed_updates: OrderUpdateResult[];
  total_processed: number;
  success_count: number;
  failure_count: number;
}

// Filter Types
export interface GalleryFilterParams {
  page?: number;
  size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Statistics Types
export interface GalleryStatistics {
  total_galleries: number;
  order_conflicts?: number;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}