import { Badge } from "@workspace/ui/components/badge";
import { HeroCarousel } from '@/components/common/HeroCarousel';
import { getGalleryImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import type { Gallery } from '@/services/galleries/types';

interface HeroSectionProps {
  galleries: Gallery[]; // Highlighted galleries only
  loading?: boolean;
}

export const HeroSection = ({ galleries, loading }: HeroSectionProps) => {
  if (loading || !galleries.length) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat galeri unggulan...</p>
        </div>
      </section>
    );
  }

  // Render each highlighted gallery as a hero slide
  const renderHeroItem = (gallery: Gallery, index: number) => (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={getGalleryImageUrl(gallery.img_url) || `https://picsum.photos/1920/1080?random=${index + 1}`}
          alt={gallery.title}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center pt-24">
        <div className="max-w-screen-xl mx-auto px-4 w-full">
          <div className="max-w-3xl text-white">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              Yayasan Baitul Muslim Lampung Timur
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {gallery.title}
            </h1>
            
            <div className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
              <RichTextDisplay 
                content={gallery.excerpt || gallery.short_excerpt}
                fallback="Pendidikan Islam Terpadu yang menggabungkan ilmu agama dan umum dengan pendekatan modern dan holistik."
                className="text-white/90"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HeroCarousel
      items={galleries}
      renderItem={renderHeroItem}
      autoScrollInterval={5000}
      showControls={true}
      showDots={true}
      pauseOnHover={true}
      fadeTransition={false}
      className="h-screen"
    />
  );
};