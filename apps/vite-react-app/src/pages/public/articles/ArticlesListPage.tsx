import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { ArrowRight, Calendar, Search, Filter } from 'lucide-react';
import { getNewsImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { Pagination } from '@/components/common/Pagination';
import type { Article } from '@/services/articles/types';
import { articleService } from '@/services/articles';

const ArticlesListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Get params from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort_by') || 'published_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localCategory, setLocalCategory] = useState(categoryFilter);

  // Available categories (you might want to fetch this from API)
  const categories = [
    'Pendidikan',
    'Kegiatan',
    'Prestasi',
    'Pengumuman',
    'Berita'
  ];

  const ArticleCardSkeleton = () => (
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

  // Load articles
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const response = await articleService.getArticles({
          page: currentPage,
          size: 12,
          search: searchQuery || undefined,
          category: categoryFilter || undefined,
          is_published: true,
          sort_by: sortBy as any,
          sort_order: sortOrder as 'asc' | 'desc'
        });

        setArticles(response.items);
        setTotalPages(response.total_pages);
        setTotalItems(response.total_items);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentPage, searchQuery, categoryFilter, sortBy, sortOrder]);

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
    if ('search' in newParams || 'category' in newParams) {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  const handleSearch = () => {
    updateParams({ 
      search: localSearch || null,
      category: localCategory || null
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
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
    setLocalCategory('');
    updateParams({ 
      search: null,
      category: null,
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
              Artikel & Berita
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Semua Artikel
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Temukan berbagai artikel dan berita terbaru seputar pendidikan dan kegiatan yayasan
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
                  placeholder="Cari artikel..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={localCategory} onValueChange={setLocalCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                  <SelectItem value="published_at-desc">Terbaru</SelectItem>
                  <SelectItem value="published_at-asc">Terlama</SelectItem>
                  <SelectItem value="title-asc">Judul A-Z</SelectItem>
                  <SelectItem value="title-desc">Judul Z-A</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || categoryFilter) && (
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
              {loading ? 'Memuat...' : `Menampilkan ${articles.length} dari ${totalItems} artikel`}
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {loading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <ArticleCardSkeleton key={index} />
              ))
            ) : articles.length > 0 ? (
              articles.map((article, index) => (
                <Card key={article.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={getNewsImageUrl(article.img_url) || `https://picsum.photos/400/240?random=${index + 1}`}
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
                      {article.category}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {article.published_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(article.published_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-muted-foreground line-clamp-3 leading-relaxed">
                      <RichTextDisplay 
                        content={article.display_excerpt || article.excerpt}
                        fallback="Deskripsi artikel yang menarik dan informatif."
                        maxLength={100}
                        className="text-muted-foreground"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/articles/${article.slug}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                        Baca Selengkapnya
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Tidak ada artikel yang ditemukan.
                </p>
                {(searchQuery || categoryFilter) && (
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
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesListPage;