import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useToast } from '@workspace/ui/components/sonner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { AlertCircle, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import { MediaFileCard, MediaFilesFiltering } from '@/components/MediaFiles';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import { MediaFileResponse, MediaFileFilterParams } from '@/services/media-files/types';
import { mediaFileService } from '@/services/media-files';

const MediaFilesPage: React.FC = () => {
  const { uploaderId } = useParams<{ uploaderId?: string }>();
  const { isAdmin, isKepalaSekolah } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MediaFileFilterParams>({
    size: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Determine user context
  const targetUploaderId = uploaderId ? parseInt(uploaderId) : user?.id;
  const isViewingOwnFiles = !uploaderId || parseInt(uploaderId) === user?.id;
  const isViewingSpecificUser = !!uploaderId;

  // Check access permissions
  const hasAccess = useMemo(() => {
    if (!targetUploaderId) return false;
    if (isAdmin()) return true;
    if (isViewingOwnFiles) return true;
    // Kepala sekolah can view files from teachers in their organization (backend will enforce this)
    if (isKepalaSekolah() && isViewingSpecificUser) return true;
    return false;
  }, [targetUploaderId, isAdmin, isViewingOwnFiles, isKepalaSekolah, isViewingSpecificUser]);

  // Fetch function for infinite scroll
  const fetchFiles = useCallback(async (page: number, params: MediaFileFilterParams) => {
    if (!targetUploaderId) {
      throw new Error('User ID not available');
    }

    const response = await mediaFileService.getFilesByUploader(targetUploaderId, {
      ...params,
      page,
      q: searchQuery.trim() || undefined
    });

    return {
      items: response.items || [],
      total: response.total || 0,
      hasNext: (page * (params.size || 20)) < (response.total || 0)
    };
  }, [targetUploaderId, searchQuery]);

  // Infinite scroll hook
  const [scrollState, scrollActions] = useInfiniteScroll({
    fetchFn: fetchFiles,
    params: filters,
    enabled: hasAccess && !!targetUploaderId
  });

  // Handlers
  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    scrollActions.refresh();
  };

  const handleFiltersChange = (newFilters: Partial<MediaFileFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      size: 20,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setSearchQuery('');
  };

  const handleFileView = async (file: MediaFileResponse) => {
    try {
      const viewInfo = await mediaFileService.getFileViewInfo(file.id);
      window.open(viewInfo.view_url, '_blank');
    } catch (error: any) {
      toast({
        title: 'Gagal Membuka File',
        description: error.message || 'Tidak dapat membuka file untuk preview.',
        variant: 'destructive'
      });
    }
  };

  // Generate page title and description
  const getPageInfo = () => {
    if (isViewingOwnFiles) {
      return {
        title: 'Media Files Saya',
        description: 'Kelola dan akses file media yang telah Anda upload'
      };
    } else {
      return {
        title: 'Media Files',
        description: `File media yang diupload oleh pengguna`
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
              : "Anda tidak memiliki akses untuk melihat halaman ini."
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
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title="Media Files"
              subtitle="Daftar file media yang telah diupload"
            />

            <SearchContainer
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Cari berdasarkan nama file..."
            />

            {/* Error State */}
            {scrollState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {scrollState.error}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollActions.refresh}
                    className="ml-2"
                  >
                    Coba Lagi
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State (First Load) */}
            {scrollState.isLoading && scrollState.items.length === 0 && (
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
            {!scrollState.isLoading && scrollState.items.length === 0 && !scrollState.error && (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Tidak Ada File
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filters.max_size
                    ? 'Tidak ditemukan file yang sesuai dengan kriteria pencarian.'
                    : 'Belum ada file yang diupload.'
                  }
                </p>
                {(searchQuery || filters.max_size) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filter
                  </Button>
                )}
              </div>
            )}

            {/* Files List with Infinite Scroll */}
            {scrollState.items.length > 0 && (
              <InfiniteScroll
                hasNextPage={scrollState.hasNextPage}
                isFetchingNextPage={scrollState.isLoadingMore}
                fetchNextPage={scrollActions.loadMore}
              >
                <div className="space-y-3">
                  {scrollState.items.map((file) => (
                    <MediaFileCard
                      key={file.id}
                      file={file}
                      onView={handleFileView}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaFilesPage;