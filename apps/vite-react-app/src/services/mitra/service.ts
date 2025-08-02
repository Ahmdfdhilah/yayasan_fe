// apps/vite-react-app/src/services/mitra/service.ts
import { BaseService } from "../base";
import {
  MitraCreate,
  MitraUpdate,
  MitraResponse,
  MitraListResponse,
  MitraFilterParams,
  MessageResponse,
} from "./types";

class MitraService extends BaseService {
  constructor() {
    super("/mitra");
  }

  // List mitras with filtering and pagination
  async getMitras(
    params?: MitraFilterParams
  ): Promise<MitraListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.get(endpoint);
  }

  // Create new mitra with optional image upload (admin only)
  async createMitra(
    data: MitraCreate,
    image?: File
  ): Promise<MitraResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.post("", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get mitra by ID
  async getMitraById(mitraId: number): Promise<MitraResponse> {
    return this.get(`/${mitraId}`);
  }

  // Update mitra with optional image upload (admin only)
  async updateMitra(
    mitraId: number,
    data: MitraUpdate,
    image?: File
  ): Promise<MitraResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.put(`/${mitraId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete mitra (admin only)
  async deleteMitra(mitraId: number): Promise<MessageResponse> {
    return this.delete(`/${mitraId}`);
  }

}

export const mitraService = new MitraService();