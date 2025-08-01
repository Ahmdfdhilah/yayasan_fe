// src/components/ui/auto-swipe-gallery/index.jsx
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@workspace/ui/components/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@workspace/ui/components/carousel";
import { ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import HeaderSection from '@workspace/ui/components/ui/header-section';

// Types for our gallery items
export interface GalleryItem {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  date?: string;
  category?: string;
  type?: string; // For social media type
  username?: string; // For social media username
  content?: string; // For social media content
  likes?: number; // For social media metrics
  comments?: number; // For social media metrics
}

interface AutoSwipeGalleryProps {
  items: GalleryItem[];
  title: string;
  subtitle: string;
  badgeText?: string;
  autoSwipeInterval?: number;
  itemsToShow?: number;
  className?: string;
  variant?: 'news' | 'services' | 'social';
  renderItem?: (item: GalleryItem) => React.ReactNode; 
}

const AutoSwipeGallery = ({
  items,
  title,
  subtitle,
  badgeText,
  autoSwipeInterval = 5000,
  itemsToShow = 3,
  className,
  variant = 'news',
  renderItem
}: AutoSwipeGalleryProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const timerRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Get responsive items to show based on screen size
  const getResponsiveItemsToShow = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 1024) return Math.min(2, itemsToShow);
      return itemsToShow;
    }
    return itemsToShow;
  };

  // Auto-swipe functionality
  useEffect(() => {
    if (!api) return;

    const startTimer = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        if (!isHovering && items.length > getResponsiveItemsToShow()) {
          if (api.canScrollNext()) {
            api.scrollNext();
          } else {
            api.scrollTo(0);
          }
        }
        startTimer();
      }, autoSwipeInterval);
    };

    startTimer();
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [api, isHovering, autoSwipeInterval, items.length, itemsToShow]);

  // Default news/services item rendering
  const renderDefaultItem = (item: GalleryItem) => (
    <Card className="h-full overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-0 h-full flex flex-col">
        {item.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {variant === 'news' && item.category && (
              <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                {item.category}
              </span>
            )}
          </div>
        )}
        <div className="p-4 flex flex-col flex-grow">
          {variant === 'news' && item.date && (
            <p className="text-sm text-gray-500 mb-2">{item.date}</p>
          )}
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
          <div className="mt-auto">
            {item.link && (
              <a
                href={item.link}
                className="text-primary font-medium hover:underline inline-flex items-center"
              >
                {variant === 'news' ? 'Read More' : 'Learn More'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("w-full py-8", className)}>
      <HeaderSection title={title} badgeText={badgeText} subtitle={subtitle}/>

      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.map((item) => (
              <CarouselItem 
                key={item.id} 
                className={cn(
                  "pl-2 md:pl-4",
                  // Responsive basis classes
                  "basis-full sm:basis-1/2",
                  itemsToShow >= 3 && "lg:basis-1/3",
                  itemsToShow >= 4 && "xl:basis-1/4"
                )}
              >
                {renderItem ? renderItem(item) : renderDefaultItem(item)}
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation arrows - hidden on mobile */}
          <CarouselPrevious className="hidden md:flex -left-6" />
          <CarouselNext className="hidden md:flex -right-6" />
        </Carousel>
      </div>
    </div>
  );
};

export default AutoSwipeGallery;