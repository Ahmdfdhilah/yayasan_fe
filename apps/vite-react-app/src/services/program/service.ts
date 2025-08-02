// apps/vite-react-app/src/services/program/service.ts
import { BaseService } from "../base";
import {
  ProgramCreate,
  ProgramUpdate,
  ProgramResponse,
  ProgramListResponse,
  ProgramFilterParams,
  MessageResponse,
} from "./types";

class ProgramService extends BaseService {
  constructor() {
    super("/programs");
  }

  // List programs with filtering and pagination
  async getPrograms(
    params?: ProgramFilterParams
  ): Promise<ProgramListResponse> {
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

  // Create new program with optional image upload (admin only)
  async createProgram(
    data: ProgramCreate,
    image?: File
  ): Promise<ProgramResponse> {
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

  // Get program by ID
  async getProgramById(programId: number): Promise<ProgramResponse> {
    return this.get(`/${programId}`);
  }

  // Update program with optional image upload (admin only)
  async updateProgram(
    programId: number,
    data: ProgramUpdate,
    image?: File
  ): Promise<ProgramResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.put(`/${programId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete program (admin only)
  async deleteProgram(programId: number): Promise<MessageResponse> {
    return this.delete(`/${programId}`);
  }

}

export const programService = new ProgramService();