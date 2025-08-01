import { useState, useEffect } from 'react';
import { Badge } from "@workspace/ui/components/badge";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getGalleryImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import type { Gallery } from '@/services/galleries/types';

interface HeroSectionProps {
  galleries: Gallery[];
  loading?: boolean;
}

export const HeroSection = ({ galleries, loading }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!galleries.length) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === galleries.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [galleries.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? galleries.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === galleries.length - 1 ? 0 : currentIndex + 1);
  };

  if (loading || !galleries.length) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat galeri...</p>
        </div>
      </section>
    );
  }

  const currentGallery = galleries[currentIndex];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={getGalleryImageUrl(currentGallery.img_url) || `https://picsum.photos/1920/1080?random=${currentIndex + 1}`}
          alt={currentGallery.title}
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
              {currentGallery.title}
            </h1>
            
            <div className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
              <RichTextDisplay 
                content={currentGallery.excerpt || currentGallery.short_excerpt}
                fallback="Pendidikan Islam Terpadu yang menggabungkan ilmu agama dan umum dengan pendekatan modern dan holistik."
                className="text-white/90"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {galleries.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Gambar selanjutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {galleries.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {galleries.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Pergi ke slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};