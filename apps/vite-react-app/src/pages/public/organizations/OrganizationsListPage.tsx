import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { ArrowRight, Users, Search } from 'lucide-react';
import { getOrganizationImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import Pagination from '@/components/common/Pagination';
import type { Organization } from '@/services/organizations/types';
import { organizationService } from '@/services/organizations';

const OrganizationsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('size') || '10'));
  
  // Get params from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || 'name';
  const sortOrder = searchParams.get('sort_order') || 'asc';

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const OrganizationCardSkeleton = () => (
    <Card>
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );

  // Load organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true);
      try {
        const response = await organizationService.getOrganizations({
          page: currentPage,
          size: itemsPerPage,
          q: searchQuery || undefined,
          sort_by: sortBy as any,
          sort_order: sortOrder as 'asc' | 'desc'
        });

        setOrganizations(response.items);
        setTotalPages(response.pages);
        setTotalItems(response.total);
      } catch (error) {
        console.error('Error loading organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
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
      {/* Header */}
      <div className="bg-primary/5 py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              Lembaga Pendidikan
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Jenjang Pendidikan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Berbagai jenjang pendidikan yang tersedia di Yayasan Baitul Muslim dengan fasilitas lengkap dan berkualitas
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="py-8 border-b bg-muted/20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari lembaga..."
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
                  <SelectItem value="name-asc">Nama A-Z</SelectItem>
                  <SelectItem value="name-desc">Nama Z-A</SelectItem>
                  <SelectItem value="user_count-desc">Anggota Terbanyak</SelectItem>
                  <SelectItem value="user_count-asc">Anggota Tersedikit</SelectItem>
                  <SelectItem value="created_at-desc">Terbaru</SelectItem>
                  <SelectItem value="created_at-asc">Terlama</SelectItem>
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
              {loading ? 'Memuat...' : `Menampilkan ${organizations.length} dari ${totalItems} lembaga`}
            </p>
          </div>

          {/* Organizations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <OrganizationCardSkeleton key={index} />
              ))
            ) : organizations.length > 0 ? (
              organizations.map((org, index) => (
                <Card key={org.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={getOrganizationImageUrl(org.img_url) || `https://picsum.photos/400/240?random=${index + 10}`}
                      alt={org.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
                      Lembaga
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {org.display_name}
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      {org.user_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{org.user_count} anggota</span>
                        </div>
                      )}
                    </div>
                    {org.head_name && (
                      <div className="text-xs text-muted-foreground">
                        Kepala: {org.head_name}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-muted-foreground line-clamp-3 leading-relaxed">
                      <RichTextDisplay 
                        content={org.description || org.excerpt}
                        fallback={`Informasi tentang ${org.name}.`}
                        maxLength={120}
                        className="text-muted-foreground"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/schools/${org.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                        Lihat Detail
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Tidak ada lembaga yang ditemukan.
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

export default OrganizationsListPage;