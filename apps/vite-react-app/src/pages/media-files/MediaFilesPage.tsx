import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useToast } from '@workspace/ui/components/sonner';
import { useURLFilters } from '@/hooks/useURLFilters';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { AlertCircle, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import Pagination from '@/components/common/Pagination';
import { MediaFileCard, MediaFilesFiltering } from '@/components/MediaFiles';
import { MediaFileResponse, MediaFileFilterParams, MediaFileListResponse } from '@/services/media-files/types';
import { mediaFileService } from '@/services/media-files';
import { API_BASE_URL } from '@/config/api';

interface MediaFilePageFilters {
  search: string;
  max_size?: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  page: number;
  size: number;
  [key: string]: string | number | boolean | null | undefined;
}

const MediaFilesPage: React.FC = () => {
  const { uploaderId } = useParams<{ uploaderId?: string }>();
  const { isAdmin, isKepalaSekolah } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();

  // URL Filters configuration
  const { updateURL, getCurrentFilters } = useURLFilters<MediaFilePageFilters>({
    defaults: {
      search: '',
      sort_by: 'created_at',
      sort_order: 'desc' as 'desc',
      page: 1,
      size: 20,
    },
    cleanDefaults: true,
  });

  // Get current filters from URL
  const filters = getCurrentFilters();

  // States
  const [files, setFiles] = useState<MediaFileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Determine user context
  const targetUploaderId = uploaderId ? parseInt(uploaderId) : user?.id;
  const isViewingOwnFiles = !uploaderId || parseInt(uploaderId) === user?.id;
  const isViewingSpecificUser = !!uploaderId;

  // Check access permissions
  const hasAccess = useMemo(() => {
    // Admin always has access
    if (isAdmin()) return true;
    
    // Kepala sekolah can view organization files or specific user files 
    if (isKepalaSekolah()) return true;
    
    // Regular users (guru) can only view their own files when not viewing specific user
    if (!isViewingSpecificUser && user?.id) return true;
    
    // For specific user viewing, check if it's own files
    if (isViewingSpecificUser && isViewingOwnFiles) return true;
    
    return false;
  }, [isAdmin, isKepalaSekolah, isViewingSpecificUser, isViewingOwnFiles, user?.id]);

  // Fetch files function
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: MediaFileFilterParams = {
        page: filters.page,
        size: filters.size,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        q: filters.search || undefined,
        max_size: filters.max_size,
      };

      let response: MediaFileListResponse;

      if (isViewingSpecificUser) {
        // Viewing specific user's files (from URL parameter)
        if (!targetUploaderId) {
          throw new Error('User ID not available');
        }
        response = await mediaFileService.getFilesByUploader(targetUploaderId, params);
      } else if (isAdmin()) {
        // Admin can see all files
        response = await mediaFileService.getMediaFiles(params);
      } else if (isKepalaSekolah()) {
        // Kepala sekolah can see files from their organization
        if (!user?.profile?.organization_id) {
          throw new Error('Organization ID not available');
        }
        response = await mediaFileService.getFilesByOrganization(user.profile.organization_id, params);
      } else {
        // Regular user (guru) sees their own files
        if (!user?.id) {
          throw new Error('User ID not available');
        }
        response = await mediaFileService.getFilesByUploader(user.id, params);
      }

      setFiles(response.items || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.pages || 0);
    } catch (error: any) {
      console.error('Failed to fetch files:', error);
      const errorMessage = error?.message || 'Gagal memuat data file. Silakan coba lagi.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch files when filters change
  useEffect(() => {
    if (hasAccess) {
      fetchFiles();
    }
  }, [filters.page, filters.size, filters.search, filters.sort_by, filters.sort_order, filters.max_size, hasAccess]);

  // Pagination handled by totalPages state

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    if (search !== filters.search) {
      updateURL({ search, page: 1 });
    }
  }, [updateURL, filters.search]);

  const handleFiltersChange = useCallback((newFilters: Partial<MediaFileFilterParams>) => {
    const urlFilters: Partial<MediaFilePageFilters> = {
      max_size: newFilters.max_size,
      sort_by: newFilters.sort_by,
      sort_order: newFilters.sort_order as 'asc' | 'desc',
      page: 1
    };
    updateURL(urlFilters);
  }, [updateURL]);

  const handleClearFilters = useCallback(() => {
    updateURL({
      search: '',
      max_size: undefined,
      sort_by: 'created_at',
      sort_order: 'desc' as 'desc',
      page: 1
    });
  }, [updateURL]);

  const handlePageChange = useCallback((page: number) => {
    updateURL({ page });
  }, [updateURL]);

  const handleItemsPerPageChange = useCallback((value: string) => {
    updateURL({ size: parseInt(value), page: 1 });
  }, [updateURL]);

  const handleFileView = useCallback(async (file: MediaFileResponse) => {
    try {
      const viewInfo = await mediaFileService.getFileViewInfo(file.id);
      window.open(`${API_BASE_URL}${viewInfo.view_url}`, '_blank');
    } catch (error: any) {
      toast({
        title: 'Gagal Membuka File',
        description: error.message || 'Tidak dapat membuka file untuk preview.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Generate page title and description
  const getPageInfo = () => {
    if (isViewingSpecificUser) {
      return {
        title: 'File Pengguna',
        description: `File yang diupload oleh pengguna`
      };
    } else if (isAdmin()) {
      return {
        title: 'Semua File',
        description: 'File yang diupload oleh semua pengguna dalam sistem'
      };
    } else if (isKepalaSekolah()) {
      return {
        title: 'File Sekolah',
        description: 'File yang diupload oleh guru dan staff di sekolah Anda'
      };
    } else {
      return {
        title: 'File Saya',
        description: 'Kelola dan akses file yang telah Anda upload'
      };
    }
  };

  const pageInfo = getPageInfo();

  // Access check
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            {isKepalaSekolah()
              ? "Anda hanya dapat melihat file dari guru di sekolah Anda."
              : "Anda tidak memiliki akses untuk melihat file ini."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageInfo.title}
        description={pageInfo.description}
      />

      {/* Filtering */}
      <Filtering>
        <MediaFilesFiltering
          filters={{
            max_size: filters.max_size,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
            size: filters.size
          }}
          onFiltersChange={handleFiltersChange}
        />
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title={pageInfo.title}
              subtitle={pageInfo.description}
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari file atau dokumen..."
            />

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchFiles}
                    className="ml-2"
                  >
                    Coba Lagi
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 animate-pulse p-4 border border-border rounded-lg">
                    <div className="h-12 w-12 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-muted rounded" />
                      <div className="h-8 w-20 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && files.length === 0 && !error && (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Tidak Ada File
                </h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.max_size
                    ? 'Tidak ditemukan file yang sesuai dengan pencarian Anda.'
                    : 'Belum ada file atau dokumen yang diupload.'
                  }
                </p>
                {(filters.search || filters.max_size) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Hapus Filter
                  </Button>
                )}
              </div>
            )}

            {/* Files List */}
            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((file) => (
                  <MediaFileCard
                    key={file.id}
                    file={file}
                    onView={handleFileView}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                itemsPerPage={filters.size}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaFilesPage;