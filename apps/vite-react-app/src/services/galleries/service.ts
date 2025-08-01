// apps/vite-react-app/src/services/galleries/service.ts
import { BaseService } from "../base";
import {
  GalleryResponse,
  GalleryListResponse,
  GallerySummary,
  GalleryFilterParams,
  GalleryStatistics,
  MessageResponse,
  GalleryCreate,
  GalleryUpdate,
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

  // Get all galleries
  async getAllGalleries(limit?: number): Promise<GalleryResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/all?${queryParams.toString()}` : "/all";
    return this.get(endpoint);
  }

  // Search galleries
  async searchGalleries(
    query: string, 
    limit?: number
  ): Promise<GalleryResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    return this.get(`/search?${queryParams.toString()}`);
  }

  // Get gallery statistics (admin only)
  async getGalleryStatistics(): Promise<GalleryStatistics> {
    return this.get("/statistics");
  }

  // Get highlighted galleries
  async getHighlightedGalleries(limit?: number): Promise<GalleryResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/highlighted?${queryParams.toString()}` : "/highlighted";
    return this.get(endpoint);
  }

  // Get non-highlighted galleries
  async getNonHighlightedGalleries(limit?: number): Promise<GalleryResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/non-highlighted?${queryParams.toString()}` : "/non-highlighted";
    return this.get(endpoint);
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

  // Create new gallery with multipart form data (admin only)
  async createGallery(
    data: GalleryCreate,
    image: File
  ): Promise<GalleryResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('image', image);
    
    return this.post("/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get gallery by ID
  async getGalleryById(
    galleryId: number
  ): Promise<GalleryResponse> {
    return this.get(`/${galleryId}`);
  }

  // Update gallery with optional image upload (admin only)
  async updateGallery(
    galleryId: number,
    data: GalleryUpdate,
    image?: File
  ): Promise<GalleryResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.put(`/${galleryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete gallery (admin only)
  async deleteGallery(
    galleryId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${galleryId}`);
  }


  // ===== HIGHLIGHT METHODS =====

  // Toggle gallery highlight status (admin only)
  async toggleGalleryHighlight(
    galleryId: number,
    isHighlight: boolean
  ): Promise<GalleryResponse> {
    return this.patch(`/${galleryId}/highlight`, isHighlight);
  }
}

export const galleryService = new GalleryService();