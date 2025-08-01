import { useState, useEffect, useRef, ReactNode } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@workspace/ui/components/carousel";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@workspace/ui/lib/utils";

interface HeroCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;
  autoScrollInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  pauseOnHover?: boolean;
  fadeTransition?: boolean;
  className?: string;
  controlsClassName?: string;
  dotsClassName?: string;
}

export function HeroCarousel<T>({
  items,
  renderItem,
  autoScrollInterval = 5000,
  showControls = true,
  showDots = true,
  pauseOnHover = true,
  fadeTransition = false,
  className,
  controlsClassName,
  dotsClassName
}: HeroCarouselProps<T>) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Initialize carousel state
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!api || items.length <= 1) return;

    const startTimer = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        if (!isHovering || !pauseOnHover) {
          if (api.canScrollNext()) {
            api.scrollNext();
          } else {
            api.scrollTo(0);
          }
        }
        startTimer();
      }, autoScrollInterval);
    };

    startTimer();
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [api, isHovering, autoScrollInterval, items.length, pauseOnHover]);

  const goToPrevious = () => {
    if (api) {
      if (api.canScrollPrev()) {
        api.scrollPrev();
      } else {
        api.scrollTo(items.length - 1);
      }
    }
  };

  const goToNext = () => {
    if (api) {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: false,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="-ml-0">
          {items.map((item, index) => (
            <CarouselItem 
              key={index}
              className="pl-0 basis-full"
            >
              <div className={cn(
                "w-full h-full",
                fadeTransition && "transition-opacity duration-1000",
                fadeTransition && index !== current && "opacity-0"
              )}>
                {renderItem(item, index, index === current)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Controls */}
      {showControls && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-20",
              "bg-black/20 hover:bg-black/40 text-white p-2 rounded-full",
              "transition-all duration-200",
              controlsClassName
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-20",
              "bg-black/20 hover:bg-black/40 text-white p-2 rounded-full",
              "transition-all duration-200",
              controlsClassName
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && items.length > 1 && (
        <div className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2",
          dotsClassName
        )}>
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200",
                index === current 
                  ? "bg-white" 
                  : "bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}