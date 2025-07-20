import { useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Generic type for filter values
type FilterValue = string | number | boolean | null | undefined;

// Generic filter object type
type Filters = Record<string, FilterValue>;

// Configuration for default values and clean URL behavior
interface FilterConfig<T extends Filters> {
  defaults: T;
  cleanDefaults?: boolean; // Whether to remove default values from URL
}

/**
 * Custom hook for managing URL query parameters for filtering
 * 
 * @param config Configuration object with default values
 * @returns Object with URL management functions
 * 
 * @example
 * ```typescript
 * const { getFiltersFromURL, updateURL, buildInitialURL, resetFilters } = useURLFilters({
 *   defaults: {
 *     period: '',
 *     filterType: 'employee' as const,
 *     employee: 'all',
 *     page: 1,
 *     limit: 10
 *   },
 *   cleanDefaults: true
 * });
 * ```
 */
export const useURLFilters = <T extends Filters>(config: FilterConfig<T>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { defaults, cleanDefaults = true } = config;
  
  // Prevent infinite loops by tracking last update
  const lastUpdateRef = useRef<string>('');
  const isUpdatingRef = useRef<boolean>(false);

  /**
   * Parse URL query parameters and return typed filter object
   */
  const getFiltersFromURL = useCallback((): T => {
    const searchParams = new URLSearchParams(location.search);
    const filters = { ...defaults };

    // Parse each parameter and cast to appropriate type
    Object.keys(defaults).forEach((key) => {
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        const defaultValue = defaults[key];
        
        // Type casting based on default value type
        if (typeof defaultValue === 'number') {
          const numValue = parseInt(urlValue);
          if (!isNaN(numValue)) {
            (filters as any)[key] = numValue;
          }
        } else if (typeof defaultValue === 'boolean') {
          (filters as any)[key] = urlValue === 'true';
        } else {
          (filters as any)[key] = urlValue;
        }
      }
    });

    return filters;
  }, [location.search, defaults]);

  /**
   * Update URL with new filter values
   */
  const updateURL = useCallback((newFilters: Partial<T>, options?: {
    replace?: boolean;
    preserveOthers?: boolean;
  }) => {
    // Prevent infinite loops
    if (isUpdatingRef.current) {
      return;
    }
    
    const { replace = true, preserveOthers = true } = options || {};
    
    let searchParams: URLSearchParams;
    
    if (preserveOthers) {
      // Start with existing params
      searchParams = new URLSearchParams(location.search);
    } else {
      // Start fresh
      searchParams = new URLSearchParams();
    }
    
    // Update or remove parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const defaultValue = defaults[key as keyof T];
        
        // Remove parameter if it matches default value and cleanDefaults is true
        if (cleanDefaults && value === defaultValue) {
          searchParams.delete(key);
        } else {
          searchParams.set(key, value.toString());
        }
      } else {
        // Remove parameter if value is null/undefined
        searchParams.delete(key);
      }
    });

    // Navigate with new search params
    const newSearch = searchParams.toString();
    const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    // Check if this is the same update we just made
    const updateKey = `${newPath}:${JSON.stringify(newFilters)}`;
    if (lastUpdateRef.current === updateKey) {
      return;
    }
    
    // Set updating flag and track this update
    isUpdatingRef.current = true;
    lastUpdateRef.current = updateKey;
    
    navigate(newPath, { replace });
    
    // Reset flag after navigation
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  }, [navigate, location.pathname, location.search, defaults, cleanDefaults]);

  /**
   * Build initial URL with default filters if no existing params
   */
  const buildInitialURL = useCallback((initialFilters?: Partial<T>) => {
    const currentFilters = getFiltersFromURL();
    const hasExistingParams = location.search.length > 0;

    // If no existing params and initial filters provided, set them
    if (!hasExistingParams && initialFilters && Object.keys(initialFilters).length > 0) {
      updateURL(initialFilters, { replace: true, preserveOthers: false });
      return { ...defaults, ...initialFilters };
    }

    return currentFilters;
  }, [getFiltersFromURL, updateURL, location.search, defaults]);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    if (cleanDefaults) {
      // Remove all query params by navigating to clean path
      navigate(location.pathname, { replace: true });
    } else {
      // Set all filters to default values
      updateURL(defaults, { replace: true, preserveOthers: false });
    }
  }, [navigate, location.pathname, updateURL, defaults, cleanDefaults]);

  /**
   * Get current filters merged with defaults
   */
  const getCurrentFilters = useCallback((): T => {
    return getFiltersFromURL();
  }, [getFiltersFromURL]);

  /**
   * Check if current filters differ from defaults
   */
  const hasActiveFilters = useCallback((): boolean => {
    const current = getFiltersFromURL();
    return Object.keys(defaults).some(key => 
      current[key as keyof T] !== defaults[key as keyof T]
    );
  }, [getFiltersFromURL, defaults]);

  /**
   * Generate a shareable URL with current filters
   */
  const getShareableURL = useCallback((): string => {
    return `${window.location.origin}${location.pathname}${location.search}`;
  }, [location.pathname, location.search]);

  return {
    getFiltersFromURL,
    updateURL,
    buildInitialURL,
    resetFilters,
    getCurrentFilters,
    hasActiveFilters,
    getShareableURL,
  };
};

export default useURLFilters;