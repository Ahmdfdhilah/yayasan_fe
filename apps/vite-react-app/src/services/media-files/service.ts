// Media Files Service Layer - Updated to match backend endpoints
import { API_BASE_URL } from "@/config/api";
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
  FileUrlResponse,
  FileBulkUpdate,
  FileMetadataUpdate,
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

    // Use axios instance to leverage auth interceptors and automatic token refresh
    return this.handleRequest(async () => {
      const { default: api } = await import('@/utils/api');
      return api.post(`${this.baseEndpoint}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });
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
   * Get file view information for static serving
   */
  async getFileViewInfo(fileId: number): Promise<MediaFileViewResponse> {
    return this.get(`/${fileId}/view`);
  }

  /**
   * Get files uploaded by specific user
   */
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

  /**
   * Get public files only (no authentication required)
   */
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

  /**
   * Download media file using backend endpoint
   */
  async downloadFile(fileId: number): Promise<Blob> {
    return this.handleRequest(async () => {
      const { default: api } = await import('@/utils/api');
      return api.get(`${this.baseEndpoint}/${fileId}/download`, {
        responseType: 'blob',
      });
    });
  }

  /**
   * Download file and trigger browser download with proper filename
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
   * View file in new tab using static URL
   */
  async viewFileInNewTab(fileId: number): Promise<void> {
    try {
      const viewInfo = await this.getFileViewInfo(fileId);
      console.log(viewInfo);
      
      const staticUrl = `${API_BASE_URL}${viewInfo.view_url}`;
      window.open(staticUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      throw error;
    }
  }

  /**
   * Get download URL for direct linking (requires authentication)
   */
  getDownloadUrl(fileId: number): string {
    const { API_BASE_URL } = require('@/config/api');
    return `${API_BASE_URL}${this.baseEndpoint}/${fileId}/download`;
  }

  /**
   * Get view URL (same as download URL since backend handles both)
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

  /**
   * Update file metadata only
   */
  async updateFileMetadata(
    fileId: number,
    metadataUpdate: FileMetadataUpdate
  ): Promise<MediaFileResponse> {
    return this.updateMediaFile(fileId, {
      file_metadata: metadataUpdate.metadata
    });
  }

  // ===== DELETE ENDPOINTS =====

  /**
   * Delete media file
   */
  async deleteMediaFile(fileId: number): Promise<MediaFileMessageResponse> {
    return this.delete(`/${fileId}`);
  }


  // ===== BULK OPERATIONS =====

  /**
   * Bulk update files
   */
  async bulkUpdateFiles(bulkUpdate: FileBulkUpdate): Promise<MediaFileMessageResponse> {
    return this.put('/bulk', bulkUpdate);
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
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'txt':
        return '📄';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return '🖼️';
      case 'zip':
      case 'rar':
      case '7z':
        return '📦';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
      case 'flac':
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
   * Create file URL response for compatibility
   */
  createFileUrlResponse(file: MediaFileResponse): FileUrlResponse {
    return {
      file_id: file.id,
      file_name: file.file_name,
      file_url: this.getDownloadUrl(file.id),
      thumbnail_url: null, // Backend doesn't support thumbnails yet
      expires_at: null
    };
  }

  /**
   * Get file category color for UI
   */
  getCategoryColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'image':
        return 'blue';
      case 'document':
        return 'green';
      case 'video':
        return 'purple';
      case 'audio':
        return 'orange';
      default:
        return 'gray';
    }
  }

  /**
   * Check if user can access file
   */
  canAccessFile(file: MediaFileResponse, currentUserId?: number): boolean {
    // Public files can be accessed by anyone
    if (file.is_public) {
      return true;
    }
    
    // Private files can only be accessed by uploader
    return currentUserId !== undefined && file.uploader_id === currentUserId;
  }

  /**
   * Get mime type icon
   */
  getMimeTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('text')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📎';
  }
}

export const mediaFileService = new MediaFileService();