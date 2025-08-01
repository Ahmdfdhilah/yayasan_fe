import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, Calendar } from 'lucide-react';
import { getNewsImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { AutoScrollCarousel } from '@/components/common/AutoScrollCarousel';
import { DetailPageHeader } from '@/components/common/DetailPageHeader';
import { DetailPageFooter } from '@/components/common/DetailPageFooter';
import { useShareHandler } from '@/hooks/useShareHandler';
import type { Article } from '@/services/articles/types';
import { articleService } from '@/services/articles';

const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const handleShare = useShareHandler();

  useEffect(() => {
    if (!id) return;

    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get article by ID
        const foundArticle = await articleService.getArticleById(parseInt(id));
        
        if (foundArticle) {
          setArticle(foundArticle);
          
          // Load latest articles (exclude current one)
          const latestResponse = await articleService.getArticles({
            is_published: true,
            size: 10, // Get more items for seamless infinite scroll
            sort_by: 'published_at',
            sort_order: 'desc'
          });
          
          // Filter out current article
          const latest = latestResponse.items.filter(a => a.id !== foundArticle.id).slice(0, 9);
          setRelatedArticles(latest);
        } else {
          setError('Artikel tidak ditemukan');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Gagal memuat artikel');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const onShare = () => {
    if (article) {
      handleShare({
        title: article.title,
        text: article.display_excerpt || article.excerpt,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="mx-auto px-4 lg:px-12 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Artikel Tidak Ditemukan'}
          </h1>
          <p className="text-muted-foreground mb-6">
            Artikel yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link to="/articles">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Artikel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Back Navigation */}
      <DetailPageHeader 
        backLabel="Kembali ke Artikel"
        backPath="/articles"
        onShare={onShare}
      />

      {/* Article Content */}
      <article className="px-4 lg:px-12 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {article.category}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {article.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            )}
          </div>

          {(article.display_excerpt || article.excerpt) && (
            <div className="text-lg text-muted-foreground leading-relaxed mb-8 p-4 bg-muted/30 rounded-lg">
              <RichTextDisplay 
                content={article.display_excerpt || article.excerpt}
                className="text-muted-foreground"
              />
            </div>
          )}
        </header>

        {/* Featured Image */}
        {article.img_url && (
          <div className="aspect-video relative overflow-hidden rounded-lg mb-8 bg-muted">
            <img 
              src={getNewsImageUrl(article.img_url)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-lg max-w-none mb-12">
          <RichTextDisplay 
            content={article.description}
            isDetailView={true}
            fallback="Konten artikel tidak tersedia."
          />
        </div>

        {/* Article Footer */}
        <DetailPageFooter 
          onShare={onShare}
          shareLabel="Bagikan Artikel"
          backPath="/articles"
          backLabel="Lihat Artikel Lainnya"
        />
      </article>

      {/* Latest Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="px-4 lg:px-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Artikel Terbaru
              </h2>
            </div>
            <AutoScrollCarousel
              items={relatedArticles}
              autoScrollInterval={4000}
              showControls={true}
              itemsPerView={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
                large: 3
              }}
              className="mb-8"
              renderItem={(relatedArticle, index) => (
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group h-full">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={getNewsImageUrl(relatedArticle.img_url) || `https://picsum.photos/300/200?random=${index + 100}`}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
                      {relatedArticle.category}
                    </Badge>
                  </div>
                  <CardContent className="p-3 flex flex-col h-32">
                    <h3 className="font-medium text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors text-sm flex-grow">
                      {relatedArticle.title}
                    </h3>
                    <div className="text-muted-foreground line-clamp-1 text-xs mb-3">
                      <RichTextDisplay 
                        content={relatedArticle.display_excerpt || relatedArticle.excerpt}
                        fallback="Deskripsi artikel..."
                        maxLength={40}
                        className="text-muted-foreground"
                      />
                    </div>
                    <Link to={`/articles/${relatedArticle.id}`} className="mt-auto">
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary text-xs">
                        Baca
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticleDetailPage;