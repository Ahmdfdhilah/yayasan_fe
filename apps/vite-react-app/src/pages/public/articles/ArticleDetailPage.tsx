import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { getNewsImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import type { Article } from '@/services/articles/types';
import { articleService } from '@/services/articles';

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!slug) return;

    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get article by slug
        const articlesResponse = await articleService.getArticles({
          search: slug,
          is_published: true,
          size: 1
        });

        const foundArticle = articlesResponse.items.find(a => a.slug === slug);
        
        if (foundArticle) {
          setArticle(foundArticle);
          
          // Load related articles from same category
          if (foundArticle.category) {
            const relatedResponse = await articleService.getArticles({
              category: foundArticle.category,
              is_published: true,
              size: 4,
              sort_by: 'published_at',
              sort_order: 'desc'
            });
            
            // Filter out current article
            const related = relatedResponse.items.filter(a => a.id !== foundArticle.id);
            setRelatedArticles(related);
          }
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
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.display_excerpt || article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b bg-muted/20">
        <div className="mx-auto px-4 lg:px-12 py-8">
          <Link to="/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Artikel
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {article.category}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="ml-auto"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
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
        <footer className="border-t pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Bagikan:</span>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan Artikel
              </Button>
            </div>
            
            <Link to="/articles">
              <Button variant="outline">
                Lihat Artikel Lainnya
              </Button>
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Artikel Terkait
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle, index) => (
                <Card key={relatedArticle.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={getNewsImageUrl(relatedArticle.img_url) || `https://picsum.photos/400/240?random=${index + 100}`}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
                      {relatedArticle.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <div className="text-sm text-muted-foreground mb-4">
                      {relatedArticle.published_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(relatedArticle.published_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-muted-foreground line-clamp-2 text-sm mb-4">
                      <RichTextDisplay 
                        content={relatedArticle.display_excerpt || relatedArticle.excerpt}
                        fallback="Deskripsi artikel..."
                        maxLength={80}
                        className="text-muted-foreground"
                      />
                    </div>
                    <Link to={`/articles/${relatedArticle.slug}`}>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                        Baca Selengkapnya
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticleDetailPage;