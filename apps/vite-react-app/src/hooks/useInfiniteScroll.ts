import { useState, useCallback, useRef, useEffect } from 'react';

export interface InfiniteScrollState<T> {
  items: T[];
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}

export interface InfiniteScrollActions {
  loadMore: () => void;
  reset: () => void;
  refresh: () => void;
}

export interface UseInfiniteScrollOptions<T, P> {
  fetchFn: (page: number, params: P) => Promise<{ items: T[]; total: number; hasNext: boolean }>;
  params: P;
  pageSize?: number;
  enabled?: boolean;
}

export function useInfiniteScroll<T, P>({
  fetchFn,
  params,
  pageSize = 10,
  enabled = true
}: UseInfiniteScrollOptions<T, P>): [InfiniteScrollState<T>, InfiniteScrollActions] {
  const [state, setState] = useState<InfiniteScrollState<T>>({
    items: [],
    hasNextPage: true,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    totalCount: 0,
    currentPage: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const currentParamsRef = useRef<string>('');

  const executeLoad = useCallback(async (page: number, isRefresh: boolean = false) => {
    if (!enabled || loadingRef.current) return;
    
    loadingRef.current = true;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({
        ...prev,
        isLoading: page === 1 && !isRefresh ? true : prev.isLoading,
        isLoadingMore: page > 1 ? true : prev.isLoadingMore,
        error: null
      }));

      const result = await fetchFn(page, params);

      setState(prev => ({
        ...prev,
        items: page === 1 ? result.items : [...prev.items, ...result.items],
        hasNextPage: result.hasNext,
        totalCount: result.total,
        currentPage: page,
        isLoading: false,
        isLoadingMore: false,
        error: null
      }));

    } catch (error: any) {
      if (error.name === 'AbortError') return; // Request was cancelled
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: error.message || 'Gagal memuat data'
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [fetchFn, params, enabled]);

  const loadMore = useCallback(() => {
    if (state.hasNextPage && !state.isLoading && !state.isLoadingMore && !loadingRef.current) {
      executeLoad(state.currentPage + 1);
    }
  }, [state.hasNextPage, state.isLoading, state.isLoadingMore, state.currentPage, executeLoad]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    loadingRef.current = false;
    
    setState({
      items: [],
      hasNextPage: true,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      totalCount: 0,
      currentPage: 0
    });
  }, []);

  const refresh = useCallback(() => {
    if (!enabled || loadingRef.current) return;
    
    reset();
    executeLoad(1, true);
  }, [enabled, reset, executeLoad]);

  // Load initial data when params change
  useEffect(() => {
    const paramsString = JSON.stringify(params);
    
    if (enabled && currentParamsRef.current !== paramsString) {
      currentParamsRef.current = paramsString;
      
      setState({
        items: [],
        hasNextPage: true,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        totalCount: 0,
        currentPage: 0
      });
      
      // Use setTimeout to prevent immediate state update conflicts
      const timer = setTimeout(() => {
        executeLoad(1);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [params, enabled, executeLoad]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return [
    state,
    {
      loadMore,
      reset,
      refresh
    }
  ];
}