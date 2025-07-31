import { useState, useEffect, useRef, ReactNode } from 'react';
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StreamingGalleryProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  title?: string;
  autoSlide?: boolean;
  slideInterval?: number;
  itemWidth?: string;
  gap?: string;
  showControls?: boolean;
  className?: string;
  itemsPerSlide?: number;
}

export function StreamingGallery<T>({
  items,
  renderItem,
  title,
  autoSlide = true,
  slideInterval = 3000,
  itemWidth = "300px",
  gap = "16px",
  showControls = true,
  className = "",
  itemsPerSlide = 3
}: StreamingGalleryProps<T>) {
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate slides based on itemsPerSlide
  const totalSlides = Math.ceil(items.length / itemsPerSlide);
  const visibleItems = items.slice(currentSlide * itemsPerSlide, (currentSlide + 1) * itemsPerSlide);

  useEffect(() => {
    if (!autoSlide || isPaused || items.length === 0 || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, isPaused, slideInterval, items.length, totalSlides]);

  useEffect(() => {
    if (!scrollRef.current || items.length === 0) return;

    const container = scrollRef.current;
    container.style.transition = 'transform 0.5s ease-in-out';
    container.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, [currentSlide]);

  const handlePrevious = () => {
    setCurrentSlide(prev => prev === 0 ? totalSlides - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`relative ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-foreground mb-8">
          {title}
        </h2>
      )}
      
      <div 
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          ref={scrollRef}
          className="flex"
          style={{ 
            width: `${totalSlides * 100}%`,
            transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div 
              key={slideIndex}
              className="flex"
              style={{ 
                width: `${100 / totalSlides}%`,
                gap,
                paddingLeft: slideIndex === 0 ? '0' : gap,
                paddingRight: slideIndex === totalSlides - 1 ? '0' : gap
              }}
            >
              {items.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((item, itemIndex) => (
                <div 
                  key={slideIndex * itemsPerSlide + itemIndex}
                  className="flex-1"
                  style={{ minWidth: '0' }}
                >
                  {renderItem(item, slideIndex * itemsPerSlide + itemIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {showControls && totalSlides > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 z-10"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 z-10"
              onClick={handleNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Progress Indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-primary' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}