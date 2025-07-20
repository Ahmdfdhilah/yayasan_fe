import { API_BASE_URL } from '@/config/api';

export const fileUtils = {
  /**
   * Generate file view URL for opening files in a new tab
   */
  getFileViewUrl(fileId: number): string {
    return `${API_BASE_URL}/files/${fileId}/view`;
  },

  /**
   * Generate file download URL
   */
  getFileDownloadUrl(fileId: number): string {
    return `${API_BASE_URL}/files/${fileId}/download`;
  },

  /**
   * Download a file by file ID
   */
  async downloadFile(fileId: number, fileName?: string): Promise<void> {
    try {
      const response = await fetch(this.getFileDownloadUrl(fileId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use provided filename
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFileName = fileName || 'download';
      
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          downloadFileName = matches[1];
        }
      }
      
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  /**
   * Open file in a new tab for viewing
   */
  viewFile(fileId: number): void {
    const viewUrl = this.getFileViewUrl(fileId);
    window.open(viewUrl, '_blank');
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