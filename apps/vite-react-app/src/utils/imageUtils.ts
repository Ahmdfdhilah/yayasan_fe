// src/utils/imageUtils.ts
import { API_BASE_URL } from '@/config/api';

/**
 * Get full image URL from API response
 * Handles both full URLs and relative paths from API
 * 
 * @param imageUrl - Image URL from API (can be full URL or relative path)
 * @param fallbackUrl - Optional fallback image URL
 * @returns Full image URL or fallback
 */
export const getImageUrl = (imageUrl?: string | null, fallbackUrl?: string): string => {
  // If no image URL provided, return fallback or default placeholder
  if (!imageUrl) {
    return fallbackUrl || '/placeholder-image.jpg';
  }

  // If it's already a full URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it starts with '/uploads/' or any other relative path, prepend base URL
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // If it's just a relative path without leading slash, add slash and prepend base URL
  return `${API_BASE_URL}/${imageUrl}`;
};

/**
 * Get news image URL specifically for news items
 * 
 * @param imageUrl - News image URL from API
 * @returns Full image URL or news placeholder
 */
export const getNewsImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl, '/placeholder-news.jpg');
};

/**
 * Get board member image URL specifically for board/team members
 * 
 * @param imageUrl - Board member image URL from API
 * @returns Full image URL or avatar placeholder
 */
export const getBoardImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl, '/placeholder-avatar.jpg');
};

/**
 * Get product image URL specifically for products
 * 
 * @param imageUrl - Product image URL from API
 * @returns Full image URL or product placeholder
 */
export const getProductImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl, '/placeholder-product.jpg');
};

/**
 * Get service image URL specifically for services
 * 
 * @param imageUrl - Service image URL from API
 * @returns Full image URL or service placeholder
 */
export const getServiceImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl, '/placeholder-service.jpg');
};

/**
 * Get partner image URL specifically for partners
 * 
 * @param imageUrl - Partner image URL from API
 * @returns Full image URL or partner placeholder
 */
export const getPartnerImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl, '/placeholder-partner.jpg');
};

/**
 * Get research project image URL specifically for research projects
 * 
 * @param imageUrl - Research project image URL from API
 * @returns Full image URL or research placeholder
 */
export const getResearchImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl, '/placeholder-research.jpg');
};

/**
 * Get company target image URL specifically for company targets
 * 
 * @param imageUrl - Company target image URL from API
 * @returns Full image URL or target placeholder
 */
export const getCompanyTargetImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl, '/placeholder-target.jpg');
};

/**
 * Check if an image URL is valid and accessible
 * 
 * @param imageUrl - Image URL to check
 * @returns Promise<boolean> - Whether the image is accessible
 */
export const isImageAccessible = async (imageUrl: string): Promise<boolean | undefined> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};

/**
 * Get optimized image URL with query parameters for different sizes
 * This assumes your API supports image optimization
 * 
 * @param imageUrl - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  imageUrl?: string | null, 
  width?: number, 
  height?: number, 
  quality: number = 80
): string => {
  const fullUrl = getImageUrl(imageUrl);
  
  // If it's a placeholder or external URL, return as is
  if (!fullUrl.includes(API_BASE_URL)) {
    return fullUrl;
  }

  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality !== 80) params.append('q', quality.toString());

  const queryString = params.toString();
  return queryString ? `${fullUrl}?${queryString}` : fullUrl;
};

/**
 * Get thumbnail image URL for list views
 * 
 * @param imageUrl - Original image URL
 * @param size - Thumbnail size (default: 300)
 * @returns Thumbnail image URL
 */
export const getThumbnailUrl = (imageUrl?: string | null, size: number = 300): string => {
  return getOptimizedImageUrl(imageUrl, size, size, 70);
};

/**
 * Get hero/banner image URL for large displays
 * 
 * @param imageUrl - Original image URL
 * @param width - Banner width (default: 1200)
 * @returns Hero image URL
 */
export const getHeroImageUrl = (imageUrl?: string | null, width: number = 1200): string => {
  return getOptimizedImageUrl(imageUrl, width, undefined, 85);
};

/**
 * Convert image URL to different formats based on browser support
 * This is a placeholder for future WebP/AVIF support
 * 
 * @param imageUrl - Original image URL
 * @param format - Desired format ('webp', 'avif', 'auto')
 * @returns Image URL with format parameter
 */
export const getImageUrlWithFormat = (
  imageUrl?: string | null, 
  format: 'webp' | 'avif' | 'auto' = 'auto'
): string => {
  const fullUrl = getImageUrl(imageUrl);
  
  // If it's a placeholder or external URL, return as is
  if (!fullUrl.includes(API_BASE_URL)) {
    return fullUrl;
  }

  // Add format parameter if supported by your API
  const separator = fullUrl.includes('?') ? '&' : '?';
  return `${fullUrl}${separator}format=${format}`;
};

/**
 * Extract filename from image URL
 * 
 * @param imageUrl - Image URL
 * @returns Filename or empty string
 */
export const getImageFilename = (imageUrl?: string | null): string => {
  if (!imageUrl) return '';
  
  try {
    const url = new URL(getImageUrl(imageUrl));
    const pathname = url.pathname;
    return pathname.split('/').pop() || '';
  } catch {
    return '';
  }
};

/**
 * Get image extension from URL
 * 
 * @param imageUrl - Image URL
 * @returns File extension or empty string
 */
export const getImageExtension = (imageUrl?: string | null): string => {
  const filename = getImageFilename(imageUrl);
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};