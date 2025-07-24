// apps/vite-react-app/src/services/galleries/service.ts
import { BaseService } from "../base";
import {
  GalleryCreate,
  GalleryUpdate,
  GalleryBulkOrderUpdate,
  GalleryResponse,
  GalleryListResponse,
  GallerySummary,
  GalleryFilterParams,
  GalleryStatistics,
  BulkOrderUpdateResponse,
  MessageResponse,
} from "./types";

class GalleryService extends BaseService {
  constructor() {
    super("/galleries");
  }

  // List galleries with filtering
  async getGalleries(
    params?: GalleryFilterParams
  ): Promise<GalleryListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : "/";
    return this.get(endpoint);
  }

  // Get active galleries
  async getActiveGalleries(limit?: number): Promise<GalleryResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/active?${queryParams.toString()}` : "/active";
    return this.get(endpoint);
  }

  // Search galleries
  async searchGalleries(
    query: string, 
    limit?: number, 
    activeOnly: boolean = true
  ): Promise<GalleryResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    queryParams.append("active_only", activeOnly.toString());
    
    return this.get(`/search?${queryParams.toString()}`);
  }

  // Get gallery statistics (admin only)
  async getGalleryStatistics(): Promise<GalleryStatistics> {
    return this.get("/statistics");
  }

  // Get order conflicts (admin only)
  async getOrderConflicts(): Promise<any> {
    return this.get("/order-conflicts");
  }

  // Get gallery summaries
  async getGallerySummaries(
    params?: GalleryFilterParams
  ): Promise<GallerySummary[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/summaries?${queryParams.toString()}` : "/summaries";
    return this.get(endpoint);
  }

  // Create new gallery (admin only)
  async createGallery(
    galleryData: GalleryCreate
  ): Promise<GalleryResponse> {
    return this.post("/", galleryData);
  }

  // Get gallery by ID
  async getGalleryById(
    galleryId: number
  ): Promise<GalleryResponse> {
    return this.get(`/${galleryId}`);
  }

  // Update gallery (admin only)
  async updateGallery(
    galleryId: number,
    galleryData: GalleryUpdate
  ): Promise<GalleryResponse> {
    return this.put(`/${galleryId}`, galleryData);
  }

  // Delete gallery (admin only)
  async deleteGallery(
    galleryId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${galleryId}`);
  }

  // Toggle active status (admin only)
  async toggleActiveStatus(
    galleryId: number
  ): Promise<GalleryResponse> {
    return this.patch(`/${galleryId}/toggle-active`);
  }

  // ===== ORDERING METHODS =====

  // Update single gallery order (admin only)
  async updateGalleryOrder(
    galleryId: number,
    newOrder: number
  ): Promise<GalleryResponse> {
    return this.patch(`/${galleryId}/order`, { new_order: newOrder });
  }

  // Bulk update gallery orders (admin only)
  async bulkUpdateGalleryOrder(
    bulkOrderData: GalleryBulkOrderUpdate
  ): Promise<BulkOrderUpdateResponse> {
    return this.post("/bulk-order", bulkOrderData);
  }

  // Normalize gallery orders (admin only)
  async normalizeGalleryOrders(): Promise<MessageResponse> {
    return this.post("/normalize-orders");
  }

  // Export all galleries in order (admin only)
  async exportGalleriesOrdered(): Promise<GalleryResponse[]> {
    return this.get("/export/ordered");
  }

  // Move gallery up one position (admin only)
  async moveGalleryUp(galleryId: number): Promise<GalleryResponse> {
    return this.post(`/move-up/${galleryId}`);
  }

  // Move gallery down one position (admin only)
  async moveGalleryDown(galleryId: number): Promise<GalleryResponse> {
    return this.post(`/move-down/${galleryId}`);
  }
}

export const galleryService = new GalleryService();