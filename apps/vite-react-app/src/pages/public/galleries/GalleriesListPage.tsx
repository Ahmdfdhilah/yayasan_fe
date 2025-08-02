import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Search, Image } from 'lucide-react';
import { getGalleryImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import Pagination from '@/components/common/Pagination';
import type { Gallery } from '@/services/galleries/types';
import { galleryService } from '@/services/galleries';

const GalleriesListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('size') || '10'));
  
  // Get params from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const GalleryCardSkeleton = () => (
    <Card>
      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );

  // Load galleries
  useEffect(() => {
    const loadGalleries = async () => {
      setLoading(true);
      try {
        const response = await galleryService.getGalleries({
          page: currentPage,
          size: itemsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy as any,
          sort_order: sortOrder as 'asc' | 'desc'
        });

        setGalleries(response.items);
        setTotalPages(response.pages);
        setTotalItems(response.total);
      } catch (error) {
        console.error('Error loading galleries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGalleries();
  }, [currentPage, searchQuery, sortBy, sortOrder, itemsPerPage]);

  // Update URL params
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filtering
    if ('search' in newParams) {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  const handleSearch = () => {
    updateParams({ 
      search: localSearch || null
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
  };

  const handleItemsPerPageChange = (value: string) => {
    const newSize = parseInt(value);
    setItemsPerPage(newSize);
    updateParams({ 
      size: value,
      page: '1' // Reset to first page
    });
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    updateParams({ 
      sort_by: newSortBy,
      sort_order: newSortOrder
    });
  };

  const clearFilters = () => {
    setLocalSearch('');
    updateParams({ 
      search: null,
      page: '1'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/1920/600?random=galleries"
            alt="Galeri Foto"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center pt-24">
          <div className="max-w-screen-xl mx-auto px-4 w-full">
            <div className="max-w-3xl text-white">
              <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
                Yayasan Baitul Muslim Lampung Timur
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Galeri Foto
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                Kumpulan foto dan dokumentasi kegiatan Yayasan Baitul Muslim Lampung Timur
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="py-8 border-b bg-muted/20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari galeri..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>

              <Button onClick={handleSearch} className="w-full sm:w-auto">
                Cari
              </Button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Terbaru</SelectItem>
                  <SelectItem value="created_at-asc">Terlama</SelectItem>
                  <SelectItem value="title-asc">Judul A-Z</SelectItem>
                  <SelectItem value="title-desc">Judul Z-A</SelectItem>
                </SelectContent>
              </Select>

              {searchQuery && (
                <Button variant="outline" onClick={clearFilters}>
                  Reset Filter
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          {/* Results Info */}
          <div className="mb-8">
            <p className="text-muted-foreground">
              {loading ? 'Memuat...' : `Menampilkan ${galleries.length} dari ${totalItems} galeri`}
            </p>
          </div>

          {/* Galleries Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3  gap-6 mb-12">
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <GalleryCardSkeleton key={index} />
              ))
            ) : galleries.length > 0 ? (
              galleries.map((gallery, index) => (
                <Card key={gallery.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={getGalleryImageUrl(gallery.img_url) || `https://picsum.photos/300/300?random=${index + 1}`}
                      alt={gallery.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
                      <Image className="w-3 h-3 mr-1" />
                      Foto
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-sm">
                      {gallery.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-muted-foreground line-clamp-2 leading-relaxed text-xs">
                      <RichTextDisplay 
                        content={gallery.excerpt || gallery.short_excerpt}
                        fallback="Dokumentasi kegiatan yayasan."
                        maxLength={60}
                        className="text-muted-foreground"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Tidak ada galeri yang ditemukan.
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Reset Filter
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleriesListPage;