// Media Files Service Layer
import { BaseService } from "../base";
import { API_BASE_URL } from "@/config/api";
import {
  MediaFileResponse,
  MediaFileListResponse,
  MediaFileFilterParams,
  MediaFileMessageResponse,
  MediaFileUpdate,
  MediaFileUploadResponse,
  MediaFileUploadData,
} from "./types";

class MediaFileService extends BaseService {
  constructor() {
    super("/media-files");
  }

  // ===== UPLOAD ENDPOINTS =====

  /**
   * Upload a file to the server
   */
  async uploadFile(uploadData: MediaFileUploadData): Promise<MediaFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    
    if (uploadData.is_public !== undefined) {
      formData.append('is_public', uploadData.is_public.toString());
    }

    // Use custom fetch for multipart/form-data
    const response = await fetch(`${API_BASE_URL}${this.baseEndpoint}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || 'Failed to upload file');
    }

    return response.json();
  }

  // ===== QUERY ENDPOINTS =====

  /**
   * Get media files with filtering
   */
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

  /**
   * Get media file details by ID
   */
  async getMediaFile(fileId: number): Promise<MediaFileResponse> {
    return this.get(`/${fileId}`);
  }

  /**
   * Download media file
   */
  async downloadFile(fileId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${this.baseEndpoint}/${fileId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  }

  /**
   * Get download URL for a file
   */
  getDownloadUrl(fileId: number): string {
    return `${API_BASE_URL}${this.baseEndpoint}/${fileId}/download`;
  }

  /**
   * Get view URL for a file (same as download but opens in browser)
   */
  getViewUrl(fileId: number): string {
    return this.getDownloadUrl(fileId);
  }

  // ===== UPDATE ENDPOINTS =====

  /**
   * Update media file metadata
   */
  async updateMediaFile(
    fileId: number, 
    updateData: MediaFileUpdate
  ): Promise<MediaFileResponse> {
    return this.put(`/${fileId}`, updateData);
  }

  // ===== DELETE ENDPOINTS =====

  /**
   * Delete media file
   */
  async deleteMediaFile(fileId: number): Promise<MediaFileMessageResponse> {
    return this.delete(`/${fileId}`);
  }

  // ===== HELPER METHODS =====

  /**
   * Check if file type can be previewed in browser
   */
  canPreviewFile(mediaFile: MediaFileResponse): boolean {
    return mediaFile.can_preview;
  }

  /**
   * Get file icon based on file type/category
   */
  getFileIcon(mediaFile: MediaFileResponse): string {
    const extension = mediaFile.extension.toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return '📄';
      case '.doc':
      case '.docx':
        return '📝';
      case '.xls':
      case '.xlsx':
        return '📊';
      case '.ppt':
      case '.pptx':
        return '📽️';
      case '.txt':
        return '📄';
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.svg':
      case '.webp':
        return '🖼️';
      case '.zip':
      case '.rar':
      case '.7z':
        return '📦';
      case '.mp4':
      case '.avi':
      case '.mov':
        return '🎥';
      case '.mp3':
      case '.wav':
      case '.flac':
        return '🎵';
      default:
        return '📎';
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Download file with proper filename handling
   */
  async downloadFileWithName(fileId: number, filename?: string): Promise<void> {
    try {
      const blob = await this.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `file-${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Open file in new tab for viewing
   */
  viewFileInNewTab(fileId: number): void {
    const viewUrl = this.getViewUrl(fileId);
    window.open(viewUrl, '_blank');
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSizeBytes: number = 100 * 1024 * 1024): string | null {
    // Check file size (default 100MB)
    if (file.size > maxSizeBytes) {
      return `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSizeBytes)})`;
    }

    // Check for empty file
    if (file.size === 0) {
      return 'File is empty';
    }

    // Check filename
    if (!file.name || file.name.trim() === '') {
      return 'File must have a valid name';
    }

    return null;
  }

  /**
   * Get files by uploader
   */
  async getFilesByUploader(
    uploaderId: number,
    params?: Omit<MediaFileFilterParams, 'uploader_id'>
  ): Promise<MediaFileListResponse> {
    return this.getMediaFiles({
      ...params,
      uploader_id: uploaderId
    });
  }

  /**
   * Get files by organization
   */
  async getFilesByOrganization(
    organizationId: number,
    params?: Omit<MediaFileFilterParams, 'organization_id'>
  ): Promise<MediaFileListResponse> {
    return this.getMediaFiles({
      ...params,
      organization_id: organizationId
    });
  }

  /**
   * Get public files only
   */
  async getPublicFiles(
    params?: Omit<MediaFileFilterParams, 'is_public'>
  ): Promise<MediaFileListResponse> {
    return this.getMediaFiles({
      ...params,
      is_public: true
    });
  }
}

export const mediaFileService = new MediaFileService();