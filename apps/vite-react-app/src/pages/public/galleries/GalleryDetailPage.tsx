import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, Share2, Calendar, Image } from 'lucide-react';
import { getGalleryImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { AutoScrollCarousel } from '@/components/common/AutoScrollCarousel';
import { DetailPageHeader } from '@/components/common/DetailPageHeader';
import { DetailPageFooter } from '@/components/common/DetailPageFooter';
import { useShareHandler } from '@/hooks/useShareHandler';
import type { Gallery } from '@/services/galleries/types';
import { galleryService } from '@/services/galleries';

const GalleryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedGalleries, setRelatedGalleries] = useState<Gallery[]>([]);
  const [imageLoading, setImageLoading] = useState(true);
  const handleShare = useShareHandler();

  useEffect(() => {
    if (!id) return;

    const loadGallery = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get gallery by ID
        const response = await galleryService.getGalleries({
          size: 100 // Get all to find by ID
        });

        const foundGallery = response.items.find(g => g.id === parseInt(id));
        
        if (foundGallery) {
          setGallery(foundGallery);
          
          // Load related galleries (exclude current one)
          const related = response.items
            .filter(g => g.id !== foundGallery.id)
            .sort((a, b) => a.display_order - b.display_order)
            .slice(0, 9);
          
          setRelatedGalleries(related);
        } else {
          setError('Galeri tidak ditemukan');
        }
      } catch (err) {
        console.error('Error loading gallery:', err);
        setError('Gagal memuat galeri');
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, [id]);

  const onShare = () => {
    if (gallery) {
      handleShare({
        title: gallery.title,
        text: gallery.excerpt || gallery.short_excerpt,
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
          <Skeleton className="h-96 w-full mb-8 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Galeri Tidak Ditemukan'}
          </h1>
          <p className="text-muted-foreground mb-6">
            Galeri yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link to="/galleries">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Galeri
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
        backLabel="Kembali ke Galeri"
        backPath="/galleries"
        onShare={onShare}
      />

      {/* Gallery Content */}
      <article className="mx-auto px-4 lg:px-12 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Image className="w-3 h-3 mr-1" />
              Galeri Foto
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {gallery.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {gallery.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(gallery.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Urutan: {gallery.display_order}</span>
            </div>
          </div>

          {(gallery.excerpt || gallery.short_excerpt) && (
            <div className="text-lg text-muted-foreground leading-relaxed mb-8 p-4 bg-muted/30 rounded-lg">
              <RichTextDisplay 
                content={gallery.excerpt || gallery.short_excerpt}
                className="text-muted-foreground"
              />
            </div>
          )}
        </header>

        {/* Main Image */}
        <div className="relative mb-8">
          <div className="relative bg-muted rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <img 
              src={getGalleryImageUrl(gallery.img_url)}
              alt={gallery.title}
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
          
          {/* Image Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onShare}
              className="bg-black/50 hover:bg-black/70 text-white border-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gallery Footer */}
        <DetailPageFooter 
          onShare={onShare}
          shareLabel="Bagikan Galeri"
          backPath="/galleries"
          backLabel="Lihat Galeri Lainnya"
        />
      </article>

      {/* Related Galleries */}
      {relatedGalleries.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="mx-auto px-4 lg:px-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Galeri Lainnya
              </h2>
            </div>
            <AutoScrollCarousel
              items={relatedGalleries}
              autoScrollInterval={3500}
              showControls={true}
              itemsPerView={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
                large: 3
              }}
              className="mb-8"
              renderItem={(relatedGallery, index) => (
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group h-full">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={getGalleryImageUrl(relatedGallery.img_url) || `https://picsum.photos/280/280?random=${index + 100}`}
                      alt={relatedGallery.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  <CardContent className="p-3 flex flex-col h-28">
                    <h3 className="font-medium text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors text-sm flex-grow">
                      {relatedGallery.title}
                    </h3>
                    <div className="text-muted-foreground line-clamp-1 text-xs mb-3">
                      <RichTextDisplay 
                        content={relatedGallery.excerpt || relatedGallery.short_excerpt}
                        fallback="Dokumentasi kegiatan..."
                        maxLength={30}
                        className="text-muted-foreground"
                      />
                    </div>
                    <Link to={`/galleries/${relatedGallery.id}`} className="mt-auto">
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary text-xs">
                        Lihat
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

export default GalleryDetailPage;