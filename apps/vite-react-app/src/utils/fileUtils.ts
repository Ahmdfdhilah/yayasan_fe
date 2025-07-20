import { mediaFileService } from '@/services';

export const fileUtils = {
  /**
   * Generate file view URL for opening files in a new tab
   */
  getFileViewUrl(fileId: number): string {
    return mediaFileService.getViewUrl(fileId);
  },

  /**
   * Generate file download URL
   */
  getFileDownloadUrl(fileId: number): string {
    return mediaFileService.getDownloadUrl(fileId);
  },

  /**
   * Download a file by file ID
   */
  async downloadFile(fileId: number, fileName?: string): Promise<void> {
    await mediaFileService.downloadFileWithName(fileId, fileName);
  },

  /**
   * Open file in a new tab for viewing
   */
  async viewFile(fileId: number): Promise<void> {
    await mediaFileService.viewFileInNewTab(fileId);
  },

  /**
   * Check if file type can be viewed in browser
   */
  canViewInBrowser(fileName: string): boolean {
    const viewableExtensions = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.svg'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return viewableExtensions.includes(extension);
  },

  /**
   * Get file extension from filename
   */
  getFileExtension(fileName: string): string {
    return fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  },

  /**
   * Get file icon based on extension or media file response
   */
  getFileIcon(fileName: string): string {
    const extension = this.getFileExtension(fileName);
    
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
        return '🖼️';
      case '.zip':
      case '.rar':
        return '📦';
      default:
        return '📎';
    }
  },

  /**
   * Format file size using media file service
   */
  formatFileSize(bytes: number): string {
    return mediaFileService.formatFileSize(bytes);
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSizeBytes?: number): string | null {
    return mediaFileService.validateFile(file, maxSizeBytes);
  }
};