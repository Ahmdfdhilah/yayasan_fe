import { useState, useEffect, useRef, ReactNode } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@workspace/ui/components/carousel";
import { cn } from "@workspace/ui/lib/utils";

interface AutoScrollCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  autoScrollInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  pauseOnHover?: boolean;
  loop?: boolean;
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  spacing?: string;
}

export function AutoScrollCarousel<T>({
  items,
  renderItem,
  autoScrollInterval = 5000,
  showControls = true,
  showDots = false,
  pauseOnHover = true,
  loop = true,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  className,
  contentClassName,
  itemClassName,
  spacing = "-ml-2 md:-ml-4"
}: AutoScrollCarouselProps<T>) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Initialize carousel state
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!api || items.length === 0) return;

    const startTimer = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        if (!isHovering || !pauseOnHover) {
          if (api.canScrollNext()) {
            api.scrollNext();
          } else if (loop) {
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
  }, [api, isHovering, autoScrollInterval, items.length, loop, pauseOnHover]);

  // Generate responsive className based on itemsPerView
  const getResponsiveClassName = () => {
    const classes = ["pl-2 md:pl-4"];
    
    if (itemsPerView.mobile === 1) classes.push("basis-full");
    else if (itemsPerView.mobile === 2) classes.push("basis-1/2");
    
    if (itemsPerView.tablet) {
      if (itemsPerView.tablet === 1) classes.push("sm:basis-full");
      else if (itemsPerView.tablet === 2) classes.push("sm:basis-1/2");
      else if (itemsPerView.tablet === 3) classes.push("sm:basis-1/3");
    }
    
    if (itemsPerView.desktop) {
      if (itemsPerView.desktop === 1) classes.push("md:basis-full");
      else if (itemsPerView.desktop === 2) classes.push("md:basis-1/2");
      else if (itemsPerView.desktop === 3) classes.push("md:basis-1/3");
      else if (itemsPerView.desktop === 4) classes.push("md:basis-1/4");
    }
    
    if (itemsPerView.large) {
      if (itemsPerView.large === 1) classes.push("lg:basis-full");
      else if (itemsPerView.large === 2) classes.push("lg:basis-1/2");
      else if (itemsPerView.large === 3) classes.push("lg:basis-1/3");
      else if (itemsPerView.large === 4) classes.push("lg:basis-1/4");
      else if (itemsPerView.large === 5) classes.push("lg:basis-1/5");
    }
    
    return cn(classes, itemClassName);
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
          loop,
          skipSnaps: false,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className={cn(spacing, contentClassName)}>
          {items.map((item, index) => (
            <CarouselItem 
              key={index}
              className={getResponsiveClassName()}
            >
              {renderItem(item, index)}
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls */}
        {showControls && items.length > 1 && (
          <>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </>
        )}
      </Carousel>

      {/* Dot Indicators */}
      {showDots && count > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === current - 1 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}