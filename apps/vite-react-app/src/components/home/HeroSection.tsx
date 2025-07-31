import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  imageUrl: string;
  name: string;
  description: string;
}

interface HeroSectionProps {
  galleryItems: GalleryImage[];
}

export const HeroSection = ({ galleryItems }: HeroSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance images
  useEffect(() => {
    if (!galleryItems || galleryItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === galleryItems.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [galleryItems]);

  const nextImage = () => {
    if (!galleryItems || galleryItems.length <= 1) return;
    setCurrentImageIndex(prev => 
      prev === galleryItems.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!galleryItems || galleryItems.length <= 1) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  const currentImage = galleryItems && galleryItems.length > 0 
    ? galleryItems[currentImageIndex]
    : null;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      {currentImage ? (
        <div className="absolute inset-0">
          <img 
            src={currentImage.imageUrl}
            alt={currentImage.name}
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10" />
      )}

      {/* Navigation Arrows - only show if multiple images */}
      {galleryItems && galleryItems.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Dots Indicator */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {galleryItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="max-w-screen-xl mx-auto px-4 text-center text-white">
          {currentImage ? (
            <>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                {currentImage.name}
              </h1>
              <p className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto text-white/90 leading-relaxed">
                {currentImage.description}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                Yayasan Baitul Muslim
              </h1>
              <p className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto text-white/90">
                Pendidikan Islam Terpadu Berkualitas Sejak 1993
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};