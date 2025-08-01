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
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Triple the items for seamless infinite scroll
  const tripleItems = [...items, ...items, ...items];
  const startIndex = items.length; // Start from middle set

  // Initialize to start index once
  useEffect(() => {
    if (items.length > 0) {
      setCurrentIndex(startIndex);
    }
  }, [items.length, startIndex]);

  useEffect(() => {
    if (!autoSlide || isPaused || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => prev + 1);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, isPaused, slideInterval, items.length]);

  useEffect(() => {
    if (!scrollRef.current || items.length === 0) return;

    const container = scrollRef.current;
    // Each item takes (100/itemsPerSlide)% of viewport, so moving by that amount shows next item
    const itemWidthPercent = 100 / itemsPerSlide;
    const scrollAmount = currentIndex * itemWidthPercent;

    // Smooth transition
    container.style.transition = 'transform 0.5s ease-in-out';
    container.style.transform = `translateX(-${scrollAmount}%)`;

    // Reset position for seamless loop
    const resetThreshold = items.length * 2; // End of second set
    if (currentIndex >= resetThreshold) {
      setTimeout(() => {
        container.style.transition = 'none';
        const resetPosition = items.length * itemWidthPercent;
        container.style.transform = `translateX(-${resetPosition}%)`;
        setCurrentIndex(items.length);
      }, 500);
    }
    
    // Reset when going backwards past first set
    if (currentIndex < items.length) {
      setTimeout(() => {
        container.style.transition = 'none';
        const resetPosition = (items.length + currentIndex) * itemWidthPercent;
        container.style.transform = `translateX(-${resetPosition}%)`;
        setCurrentIndex(items.length + currentIndex);
      }, 500);
    }
  }, [currentIndex, items.length, itemsPerSlide]);

  const handlePrevious = () => {
    setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
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
        className="relative overflow-hidden h-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          ref={scrollRef}
          className="flex"
          style={{ 
            width: `${tripleItems.length * (100 / itemsPerSlide)}%`,
            gap
          }}
        >
          {tripleItems.map((item, index) => (
            <div 
              key={`${index}-${Math.floor(index / items.length)}`}
              className="flex-shrink-0"
              style={{ 
                width: `${100 / itemsPerSlide}%`,
                minWidth: `${100 / itemsPerSlide}%`
              }}
            >
              {renderItem(item, index % items.length)}
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {showControls && items.length > 0 && (
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
        {items.length > itemsPerSlide && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  ((currentIndex - startIndex) % items.length) === index 
                    ? 'bg-primary' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentIndex(startIndex + index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}