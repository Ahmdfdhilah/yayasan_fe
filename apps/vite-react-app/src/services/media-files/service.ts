import { BaseService } from "../base";
import {
  MediaFileResponse,
  MediaFileListResponse,
  MediaFileFilterParams,
  MediaFileMessageResponse,
  MediaFileUpdate,
  MediaFileUploadResponse,
  MediaFileUploadData,
  MediaFileViewResponse,
  FileBulkUpdate,
} from "./types";
import api from "@/utils/api";

class MediaFileService extends BaseService {
  constructor() {
    super("/media-files");
  }

  async uploadFile(uploadData: MediaFileUploadData): Promise<MediaFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', uploadData.file);

    return this.handleRequest(async () => {
      return api.post(`${this.baseEndpoint}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });
  }

  async getMediaFiles(
    params?: MediaFileFilterParams
  ): Promise<MediaFileListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/?${queryParams.toString()}` 
      : "/";
    return this.get(endpoint);
  }

  async getMediaFile(fileId: number): Promise<MediaFileResponse> {
    return this.get(`/${fileId}`);
  }

  async getFileViewInfo(fileId: number): Promise<MediaFileViewResponse> {
    return this.get(`/${fileId}/view`);
  }

  async getFilesByUploader(
    uploaderId: number,
    params?: Omit<MediaFileFilterParams, 'uploader_id'>
  ): Promise<MediaFileListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/uploader/${uploaderId}?${queryParams.toString()}` 
      : `/uploader/${uploaderId}`;
    return this.get(endpoint);
  }

  async getPublicFiles(
    params?: Omit<MediaFileFilterParams, 'is_public'>
  ): Promise<MediaFileListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/public/list?${queryParams.toString()}` 
      : "/public/list";
    
    return this.get(endpoint);
  }

  async downloadFile(fileId: number): Promise<Blob> {
    return this.handleRequest(async () => {
      return api.get(`${this.baseEndpoint}/${fileId}/download`, {
        responseType: 'blob',
      });
    });
  }

  async updateMediaFile(
    fileId: number, 
    updateData: MediaFileUpdate
  ): Promise<MediaFileResponse> {
    return this.put(`/${fileId}`, updateData);
  }

  async deleteMediaFile(fileId: number): Promise<MediaFileMessageResponse> {
    return this.delete(`/${fileId}`);
  }

  async bulkUpdateFiles(bulkUpdate: FileBulkUpdate): Promise<MediaFileMessageResponse> {
    return this.put('/bulk', bulkUpdate);
  }

  async getFilesByOrganization(
    organizationId: number,
    params?: Omit<MediaFileFilterParams, 'organization_id'>
  ): Promise<MediaFileListResponse> {
    return this.getMediaFiles({
      ...params,
      organization_id: organizationId
    });
  }
}

export const mediaFileService = new MediaFileService();