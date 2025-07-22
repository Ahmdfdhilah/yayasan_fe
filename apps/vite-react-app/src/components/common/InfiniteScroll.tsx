import React, { useEffect, useRef, useCallback } from 'react';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface InfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  children,
  threshold = 100,
  className = '',
  loadingComponent
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  const defaultLoadingComponent = (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={className}>
      {children}
      
      {/* Loading trigger element */}
      <div ref={loadingRef} className="py-4">
        {isFetchingNextPage && (loadingComponent || defaultLoadingComponent)}
      </div>
      
      {/* End message */}
      {!hasNextPage && !isFetchingNextPage && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Semua file telah ditampilkan
          </p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;