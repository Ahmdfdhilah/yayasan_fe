import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteSearchOptions<T> {
  searchFn: (query: string, page: number, limit: number) => Promise<{
    data: T[];
    hasMore: boolean;
    total?: number;
  }>;
  limit?: number;
  debounceMs?: number;
  initialQuery?: string;
}

interface UseInfiniteSearchResult<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  query: string;
  setQuery: (query: string) => void;
  loadMore: () => void;
  refresh: () => void;
  total?: number;
}

export function useInfiniteSearch<T>({
  searchFn,
  limit = 10,
  debounceMs = 300,
  initialQuery = ''
}: UseInfiniteSearchOptions<T>): UseInfiniteSearchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | undefined>();
  
  const debounceTimeoutRef = useRef<any | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const search = useCallback(async (searchQuery: string, pageNum: number, isLoadMore = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const result = await searchFn(searchQuery, pageNum, limit);
      
      if (abortControllerRef.current.signal.aborted) {
        return;
      }
      
      if (isLoadMore) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchFn, limit]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setPage(1);
      search(searchQuery, 1, false);
    }, debounceMs);
  }, [search, debounceMs]);

  const handleSetQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    search(query, nextPage, true);
  }, [hasMore, loading, loadingMore, page, query, search]);

  const refresh = useCallback(() => {
    setPage(1);
    search(query, 1, false);
  }, [query, search]);

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery, 1, false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    query,
    setQuery: handleSetQuery,
    loadMore,
    refresh,
    total
  };
}